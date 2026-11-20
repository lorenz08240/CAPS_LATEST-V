import CourseShell from "./CourseShell";
import FullscreenGate from "../FullscreenGate/FullscreenGate";

export default function Learn() {
  return (
    <FullscreenGate requireFullscreen>
      <CourseShell />
    </FullscreenGate>
  );
}
