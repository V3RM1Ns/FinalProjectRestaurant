namespace RestaurantManagment.Application.Common.DTOs.JobApplication;

public class JobApplicationDto
{
    public string Id { get; set; } = string.Empty;
    public string JobPostingId { get; set; } = string.Empty;
    public string JobTitle { get; set; } = string.Empty;
    public string RestaurantName { get; set; } = string.Empty;
    public string ApplicantId { get; set; } = string.Empty;
    public string ApplicantName { get; set; } = string.Empty;
    public string ApplicantEmail { get; set; } = string.Empty;
    public string ApplicantPhone { get; set; } = string.Empty;
    public string CoverLetter { get; set; } = string.Empty;
    public string? ResumeUrl { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime ApplicationDate { get; set; }
    public DateTime? ReviewedDate { get; set; }
    public string? ReviewNotes { get; set; }
}

