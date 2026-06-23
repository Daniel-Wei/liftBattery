namespace LiftBattery.Api.Data.Entities.Training;

public sealed class TrainingExercise
{
    public required string Id { get; set; }
    public required string TrainingSessionId { get; set; }
    public required int ExerciseOrder {get; set;}
    public required string MuscleGroup { get; set; }
    public required string ExerciseName { get; set; }
    public DateTimeOffset CreatedAtUtc { get; set; }
    public DateTimeOffset UpdatedAtUtc { get; set; }
    public required TrainingSession TrainingSession;
    public ICollection<TrainingSet> Sets { get; set; }
        = new List<TrainingSet>();
}
