namespace LiftBattery.Api.Data.Entities.Training;

public sealed class TrainingSession
{
    public int Id { get; set; }
    public int TrainingDayId { get; set; }
    public required TimeOnly StartTime { get; set; }
    public required int DurationMinutes { get; set; }
    public required decimal SessionRpe { get; set; }
    public DateTimeOffset CreatedAtUtc { get; set; }
    public DateTimeOffset UpdatedAtUtc { get; set; }
    public required TrainingDay TrainingDay { get; set; }
    public ICollection<TrainingExercise> Exercises { get; set; }
        = new List<TrainingExercise>();
}
