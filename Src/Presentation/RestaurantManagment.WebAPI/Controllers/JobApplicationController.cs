using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

using RestaurantManagment.Application.Common.DTOs.JobApplication;
using RestaurantManagment.Application.Common.Interfaces;
using RestaurantManagment.Domain.Models;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using RestaurantManagment.Application.Common.DTOs.JobPosting;

namespace RestaurantManagment.WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController] 
    [Authorize]
    public class JobApplicationController : ControllerBase
    {
        private readonly IAppDbContext _context;
        private readonly IEmailService _emailService;

        public JobApplicationController(IAppDbContext context, IEmailService emailService)
        {
            _context = context;
            _emailService = emailService;
        }

     
        [HttpGet("my-applications")]
        [Authorize(Roles = "Customer")]
        public async Task<ActionResult<IEnumerable<JobApplicationDto>>> GetMyApplications()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var applications = await _context.JobApplications
                .Include(ja => ja.JobPosting)
                .ThenInclude(jp => jp.Restaurant)
                .Where(ja => ja.ApplicantId == userId)
                .Select(ja => new JobApplicationDto
                {
                    Id = ja.Id,
                    JobPostingId = ja.JobPostingId,
                    JobTitle = ja.JobPosting.Title,
                    RestaurantName = ja.JobPosting.Restaurant.Name,
                    ApplicantId = ja.ApplicantId,
                    CoverLetter = ja.CoverLetter,
                    ResumeUrl = ja.ResumeUrl,
                    Status = ja.Status,
                    ApplicationDate = ja.ApplicationDate,
                    ReviewedDate = ja.ReviewedDate,
                    ReviewNotes = ja.ReviewNotes
                })
                .OrderByDescending(ja => ja.ApplicationDate)
                .ToListAsync();

            return Ok(applications);
        }

     
        [HttpGet("restaurant/{restaurantId}")]
        [Authorize(Roles = "Owner")]
        public async Task<ActionResult<IEnumerable<JobApplicationDto>>> GetRestaurantApplications(string restaurantId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

          
            var restaurant = await _context.Restaurants.FindAsync(restaurantId);
            if (restaurant == null)
                return NotFound(new { message = "Restaurant not found" });

            if (restaurant.OwnerId != userId)
                return Forbid();

            var applications = await _context.JobApplications
                .Include(ja => ja.JobPosting)
                    .ThenInclude(jp => jp.Restaurant)
                .Include(ja => ja.Applicant)
                .Where(ja => ja.JobPosting.RestaurantId == restaurantId)
                .Select(ja => new JobApplicationDto
                {
                    Id = ja.Id,
                    JobPostingId = ja.JobPostingId,
                    JobTitle = ja.JobPosting.Title,
                    RestaurantName = ja.JobPosting.Restaurant.Name,
                    ApplicantId = ja.ApplicantId,
                    ApplicantName = ja.Applicant.FullName,
                    ApplicantEmail = ja.Applicant.Email ?? "",
                    ApplicantPhone = ja.Applicant.PhoneNumber ?? "",
                    CoverLetter = ja.CoverLetter,
                    ResumeUrl = ja.ResumeUrl,
                    Status = ja.Status,
                    ApplicationDate = ja.ApplicationDate,
                    ReviewedDate = ja.ReviewedDate,
                    ReviewNotes = ja.ReviewNotes
                })
                .OrderByDescending(ja => ja.ApplicationDate)
                .ToListAsync();

            return Ok(applications);
        }

       
        [HttpGet("job-posting/{jobPostingId}")]
        [Authorize(Roles = "Owner")]
        public async Task<ActionResult<IEnumerable<JobApplicationDto>>> GetJobPostingApplications(string jobPostingId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var jobPosting = await _context.JobPostings
                .Include(jp => jp.Restaurant)
                .FirstOrDefaultAsync(jp => jp.Id == jobPostingId);

            if (jobPosting == null)
                return NotFound(new { message = "Job posting not found" });

            if (jobPosting.Restaurant == null || jobPosting.Restaurant.OwnerId != userId)
                return Forbid();

            var applications = await _context.JobApplications
                .Include(ja => ja.Applicant)
                .Include(ja => ja.JobPosting)
                    .ThenInclude(jp => jp.Restaurant)
                .Where(ja => ja.JobPostingId == jobPostingId)
                .Select(ja => new JobApplicationDto
                {
                    Id = ja.Id,
                    JobPostingId = ja.JobPostingId,
                    JobTitle = ja.JobPosting.Title,
                    RestaurantName = ja.JobPosting.Restaurant.Name,
                    ApplicantId = ja.ApplicantId,
                    ApplicantName = ja.Applicant.FullName,
                    ApplicantEmail = ja.Applicant.Email ?? "",
                    ApplicantPhone = ja.Applicant.PhoneNumber ?? "",
                    CoverLetter = ja.CoverLetter,
                    ResumeUrl = ja.ResumeUrl,
                    Status = ja.Status,
                    ApplicationDate = ja.ApplicationDate,
                    ReviewedDate = ja.ReviewedDate,
                    ReviewNotes = ja.ReviewNotes
                })
                .OrderByDescending(ja => ja.ApplicationDate)
                .ToListAsync();

            return Ok(applications);
        }

       
        [HttpPost]
        [Authorize(Roles = "Customer")]
        public async Task<ActionResult<JobApplicationDto>> CreateJobApplication(CreateJobApplicationDto dto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var jobPosting = await _context.JobPostings
                .Include(jp => jp.Restaurant)
                .ThenInclude(r => r.Owner)
                .FirstOrDefaultAsync(jp => jp.Id == dto.JobPostingId);

            if (jobPosting == null)
                return NotFound("Job posting not found");

            if (!jobPosting.IsActive)
                return BadRequest("Job posting is not active");

           
            var existingApplication = await _context.JobApplications
                .FirstOrDefaultAsync(ja => ja.JobPostingId == dto.JobPostingId && ja.ApplicantId == userId);

            if (existingApplication != null)
                return BadRequest("You have already applied to this job posting");

            var applicant = await _context.Users.FindAsync(userId);

            var application = new JobApplication
            {
                JobPostingId = dto.JobPostingId,
                ApplicantId = userId!,
                CoverLetter = dto.CoverLetter,
                ResumeUrl = dto.ResumeUrl,
                Status = "Pending",
                ApplicationDate = DateTime.UtcNow
            };

            _context.JobApplications.Add(application);
            await _context.SaveChangesAsync();

        
            try
            {
                if (applicant != null && jobPosting.Restaurant.Owner != null)
                {
                    await _emailService.SendNewJobApplicationNotificationAsync(
                        jobPosting.Restaurant.Owner.Email ?? "",
                        jobPosting.Restaurant.Owner.FullName,
                        applicant.FullName,
                        jobPosting.Title,
                        jobPosting.Restaurant.Name
                    );
                }
            }
            catch (Exception)
            {
          
            }

            var result = new JobApplicationDto
            {
                Id = application.Id,
                JobPostingId = application.JobPostingId,
                JobTitle = jobPosting.Title,
                RestaurantName = jobPosting.Restaurant.Name,
                ApplicantId = application.ApplicantId,
                ApplicantName = applicant?.FullName ?? "",
                ApplicantEmail = applicant?.Email ?? "",
                ApplicantPhone = applicant?.PhoneNumber ?? "",
                CoverLetter = application.CoverLetter,
                ResumeUrl = application.ResumeUrl,
                Status = application.Status,
                ApplicationDate = application.ApplicationDate
            };

            return CreatedAtAction(nameof(GetJobPostingApplications), new { jobPostingId = application.JobPostingId }, result);
        }

     
        [HttpPut("review")]
        [Authorize(Roles = "Owner")]
        public async Task<IActionResult> ReviewJobApplication(ReviewJobApplicationDto dto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var application = await _context.JobApplications
                .Include(ja => ja.JobPosting)
                    .ThenInclude(jp => jp.Restaurant)
                .Include(ja => ja.Applicant)
                .FirstOrDefaultAsync(ja => ja.Id == dto.ApplicationId);

            if (application == null)
                return NotFound(new { message = "Job application not found" });

            if (application.JobPosting?.Restaurant == null)
                return BadRequest(new { message = "Invalid job application data" });

            if (application.JobPosting.Restaurant.OwnerId != userId)
                return Forbid();

            application.Status = dto.Status;
            application.ReviewNotes = dto.ReviewNotes;
            application.ReviewedDate = DateTime.UtcNow;
            application.ReviewedBy = userId;

            await _context.SaveChangesAsync();

           
            try
            {
                if (application.Applicant != null && !string.IsNullOrEmpty(application.Applicant.Email))
                {
                    await _emailService.SendJobApplicationStatusEmailAsync(
                        application.Applicant.Email,
                        application.Applicant.FullName,
                        application.JobPosting.Title,
                        application.JobPosting.Restaurant.Name,
                        dto.Status,
                        dto.ReviewNotes
                    );
                }
            }
            catch (Exception)
            {
               
            }

            return NoContent();
        }

      
        [HttpDelete("{id}")]
        [Authorize(Roles = "Customer")]
        public async Task<IActionResult> DeleteJobApplication(string id)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var application = await _context.JobApplications.FindAsync(id);

            if (application == null)
                return NotFound();

            if (application.ApplicantId != userId)
                return Forbid();

            _context.JobApplications.Remove(application);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}


namespace RestaurantManagment.WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Owner")]
    public class JobPostingController : ControllerBase
    {
        private readonly IAppDbContext _context;

        public JobPostingController(IAppDbContext context)
        {
            _context = context;
        }

     
        [HttpGet("restaurant/{restaurantId}")]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<JobPostingDto>>> GetJobPostingsByRestaurant(string restaurantId)
        {
            var jobPostings = await _context.JobPostings
                .Include(jp => jp.Restaurant)
                .Include(jp => jp.Applications)
                .Where(jp => jp.RestaurantId == restaurantId && jp.IsActive)
                .Select(jp => new JobPostingDto
                {
                    Id = jp.Id,
                    Title = jp.Title,
                    Description = jp.Description,
                    Requirements = jp.Requirements,
                    Position = jp.Position,
                    Salary = jp.Salary,
                    EmploymentType = jp.EmploymentType,
                    PostedDate = jp.PostedDate,
                    ExpiryDate = jp.ExpiryDate,
                    IsActive = jp.IsActive,
                    RestaurantId = jp.RestaurantId,
                    RestaurantName = jp.Restaurant.Name,
                    ApplicationCount = jp.Applications.Count
                })
                .ToListAsync();

            return Ok(jobPostings);
        }

        
        [HttpGet("active")]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<JobPostingDto>>> GetActiveJobPostings()
        {
            var jobPostings = await _context.JobPostings
                .Include(jp => jp.Restaurant)
                .Include(jp => jp.Applications)
                .Where(jp => jp.IsActive && (jp.ExpiryDate == null || jp.ExpiryDate > DateTime.UtcNow))
                .Select(jp => new JobPostingDto
                {
                    Id = jp.Id,
                    Title = jp.Title,
                    Description = jp.Description,
                    Requirements = jp.Requirements,
                    Position = jp.Position,
                    Salary = jp.Salary,
                    EmploymentType = jp.EmploymentType,
                    PostedDate = jp.PostedDate,
                    ExpiryDate = jp.ExpiryDate,
                    IsActive = jp.IsActive,
                    RestaurantId = jp.RestaurantId,
                    RestaurantName = jp.Restaurant.Name,
                    ApplicationCount = jp.Applications.Count
                })
                .OrderByDescending(jp => jp.PostedDate)
                .ToListAsync();

            return Ok(jobPostings);
        }

     
        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult<JobPostingDto>> GetJobPosting(string id)
        {
            var jobPosting = await _context.JobPostings
                .Include(jp => jp.Restaurant)
                .Include(jp => jp.Applications)
                .Where(jp => jp.Id == id)
                .Select(jp => new JobPostingDto
                {
                    Id = jp.Id,
                    Title = jp.Title,
                    Description = jp.Description,
                    Requirements = jp.Requirements,
                    Position = jp.Position,
                    Salary = jp.Salary,
                    EmploymentType = jp.EmploymentType,
                    PostedDate = jp.PostedDate,
                    ExpiryDate = jp.ExpiryDate,
                    IsActive = jp.IsActive,
                    RestaurantId = jp.RestaurantId,
                    RestaurantName = jp.Restaurant.Name,
                    ApplicationCount = jp.Applications.Count
                })
                .FirstOrDefaultAsync();

            if (jobPosting == null)
                return NotFound();

            return Ok(jobPosting);
        }

      
        [HttpPost]
        public async Task<ActionResult<JobPostingDto>> CreateJobPosting(CreateJobPostingDto dto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            
            var restaurant = await _context.Restaurants.FindAsync(dto.RestaurantId);
            if (restaurant == null)
                return NotFound(new { message = "Restaurant not found" });

            if (restaurant.OwnerId != userId)
                return Forbid();

            var jobPosting = new JobPosting
            {
                Title = dto.Title,
                Description = dto.Description,
                Requirements = dto.Requirements,
                Position = dto.Position,
                Salary = dto.Salary,
                EmploymentType = dto.EmploymentType,
                ExpiryDate = dto.ExpiryDate,
                RestaurantId = dto.RestaurantId,
                IsActive = true,
                PostedDate = DateTime.UtcNow
            };

            _context.JobPostings.Add(jobPosting);
            await _context.SaveChangesAsync();

            var result = new JobPostingDto
            {
                Id = jobPosting.Id,
                Title = jobPosting.Title,
                Description = jobPosting.Description,
                Requirements = jobPosting.Requirements,
                Position = jobPosting.Position,
                Salary = jobPosting.Salary,
                EmploymentType = jobPosting.EmploymentType,
                PostedDate = jobPosting.PostedDate,
                ExpiryDate = jobPosting.ExpiryDate,
                IsActive = jobPosting.IsActive,
                RestaurantId = jobPosting.RestaurantId,
                RestaurantName = restaurant.Name,
                ApplicationCount = 0
            };

            return CreatedAtAction(nameof(GetJobPosting), new { id = jobPosting.Id }, result);
        }

        
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateJobPosting(string id, UpdateJobPostingDto dto)
        {
            if (id != dto.Id)
                return BadRequest(new { message = "Id mismatch" });

            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var jobPosting = await _context.JobPostings
                .Include(jp => jp.Restaurant)
                .FirstOrDefaultAsync(jp => jp.Id == id);

            if (jobPosting == null)
                return NotFound(new { message = "Job posting not found" });

            if (jobPosting.Restaurant == null || jobPosting.Restaurant.OwnerId != userId)
                return Forbid();

            jobPosting.Title = dto.Title;
            jobPosting.Description = dto.Description;
            jobPosting.Requirements = dto.Requirements;
            jobPosting.Position = dto.Position;
            jobPosting.Salary = dto.Salary;
            jobPosting.EmploymentType = dto.EmploymentType;
            jobPosting.ExpiryDate = dto.ExpiryDate;
            jobPosting.IsActive = dto.IsActive;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!await JobPostingExists(id))
                    return NotFound(new { message = "Job posting not found" });
                throw;
            }

            return NoContent();
        }
        
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteJobPosting(string id)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var jobPosting = await _context.JobPostings
                .Include(jp => jp.Restaurant)
                .FirstOrDefaultAsync(jp => jp.Id == id);

            if (jobPosting == null)
                return NotFound(new { message = "Job posting not found" });

            if (jobPosting.Restaurant == null || jobPosting.Restaurant.OwnerId != userId)
                return Forbid();

            _context.JobPostings.Remove(jobPosting);
            await _context.SaveChangesAsync();

            return NoContent();
        }
        
        [HttpGet("my-restaurants")]
        public async Task<ActionResult<IEnumerable<JobPostingDto>>> GetMyRestaurantsJobPostings()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var jobPostings = await _context.JobPostings
                .Include(jp => jp.Restaurant)
                .Include(jp => jp.Applications)
                .Where(jp => jp.Restaurant.OwnerId == userId)
                .Select(jp => new JobPostingDto
                {
                    Id = jp.Id,
                    Title = jp.Title,
                    Description = jp.Description,
                    Requirements = jp.Requirements,
                    Position = jp.Position,
                    Salary = jp.Salary,
                    EmploymentType = jp.EmploymentType,
                    PostedDate = jp.PostedDate,
                    ExpiryDate = jp.ExpiryDate,
                    IsActive = jp.IsActive,
                    RestaurantId = jp.RestaurantId,
                    RestaurantName = jp.Restaurant.Name,
                    ApplicationCount = jp.Applications.Count
                })
                .OrderByDescending(jp => jp.PostedDate)
                .ToListAsync();

            return Ok(jobPostings);
        }

        private async Task<bool> JobPostingExists(string id)
        {
            return await _context.JobPostings.AnyAsync(jp => jp.Id == id);
        }
    }
}

