namespace LiftBattery.Api.Data.Entities.Training;

public sealed class TrainingDay
{
    public required string Id { get; set; }
    public required int UserId { get; set; }
    public required DateTime Date { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
    public ICollection<TrainingSession> Sessions { get; set; }
        = new List<TrainingSession>();
}
