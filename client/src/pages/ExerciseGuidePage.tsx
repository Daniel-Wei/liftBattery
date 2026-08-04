import { useMemo, useState } from "react";
import { MuscleViewer } from "../components/MuscleViewer";
import { SectionCard } from "../components/SectionCard";
import {
  formatBenchAngle,
  getBenchAngleOptions,
  getDefaultBenchAngle,
  getDefaultExerciseForMuscleGroup,
  getExerciseDisplayLabel,
  getExerciseOptionsForMuscleGroup,
  getMuscleGroupDisplayLabel,
  muscleGroupOptions,
} from "../data/programValues";
import { getExerciseMuscleContribution } from "../domain/exerciseMuscleMap";
import type { MuscleGroup } from "../types/appTypes";

export function ExerciseGuidePage() {
  const [muscleGroup, setMuscleGroup] = useState<Exclude<MuscleGroup, "All">>("Chest");
  const [exerciseName, setExerciseName] = useState(getDefaultExerciseForMuscleGroup("Chest"));
  const [benchAngleDegrees, setBenchAngleDegrees] = useState<number | undefined>(
    getDefaultBenchAngle(getDefaultExerciseForMuscleGroup("Chest")),
  );
  const exerciseOptions = getExerciseOptionsForMuscleGroup(muscleGroup);
  const angleOptions = getBenchAngleOptions(exerciseName);
  const contribution = useMemo(
    () => getExerciseMuscleContribution(exerciseName, muscleGroup),
    [exerciseName, muscleGroup],
  );

  function changeMuscleGroup(value: string) {
    const nextGroup = value as Exclude<MuscleGroup, "All">;
    const nextExercise = getDefaultExerciseForMuscleGroup(nextGroup);
    setMuscleGroup(nextGroup);
    setExerciseName(nextExercise);
    setBenchAngleDegrees(getDefaultBenchAngle(nextExercise));
  }

  function changeExercise(value: string) {
    setExerciseName(value);
    setBenchAngleDegrees(getDefaultBenchAngle(value));
  }

  return (
    <div className="page page-stack">
      <SectionCard title="动作指引与 3D 肌肉图">
        <p className="muted-text">选择动作后展开肌肉图，可旋转 3D 模型并查看主要、次要参与肌群。</p>
        <div className="training-session-form training-session-form--exercise exercise-guide-controls">
          <label className="training-form-field">
            <span className="training-form-label">主要肌群</span>
            <select className="training-input" value={muscleGroup} onChange={(event) => changeMuscleGroup(event.target.value)}>
              {muscleGroupOptions.map((group) => <option key={group} value={group}>{getMuscleGroupDisplayLabel(group)}</option>)}
            </select>
          </label>
          <label className="training-form-field">
            <span className="training-form-label">动作</span>
            <select className="training-input" value={exerciseName} onChange={(event) => changeExercise(event.target.value)}>
              {exerciseOptions.map((exercise) => <option key={exercise} value={exercise}>{getExerciseDisplayLabel(exercise)}</option>)}
            </select>
          </label>
          {angleOptions.length > 0 ? <label className="training-form-field"><span className="training-form-label">卧推角度</span><select className="training-input" value={benchAngleDegrees ?? angleOptions[0]} onChange={(event) => setBenchAngleDegrees(Number(event.target.value))}>{angleOptions.map((angle) => <option key={angle} value={angle}>{formatBenchAngle(angle)}</option>)}</select></label> : null}
        </div>
        <MuscleViewer title={`${getExerciseDisplayLabel(exerciseName)}${benchAngleDegrees !== undefined ? ` · ${formatBenchAngle(benchAngleDegrees)}` : ""}`} activations={contribution?.muscles ?? []} tip={contribution?.tip} compact={false} />
      </SectionCard>
    </div>
  );
}
