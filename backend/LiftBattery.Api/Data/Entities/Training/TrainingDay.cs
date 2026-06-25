namespace LiftBattery.Api.Data.Entities.Training;

public sealed class TrainingDay
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public required DateOnly Date { get; set; }
    public DateTimeOffset CreatedAtUtc { get; set; }
    public DateTimeOffset UpdatedAtUtc { get; set; }
    public ICollection<TrainingSession> Sessions { get; set; }
        = new List<TrainingSession>();
}
