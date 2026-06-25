namespace LiftBattery.Api.Data.Entities;

public sealed class PreCheck
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public DateOnly PreCheckDate { get; set; }
    public decimal SleepHours { get; set; }
    public int Soreness { get; set; }
    public int Motivation { get; set; }
    public int RestingHeartRateDelta { get; set; }
    public int PreviousSessionRpe { get; set; }
    public int PreviousSessionDurationMinutes { get; set; }
    public DateTimeOffset CreatedAtUtc { get; set; }
    public DateTimeOffset UpdatedAtUtc { get; set; }
}
