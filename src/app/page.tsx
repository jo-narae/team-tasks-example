import { TaskBoard } from "@/components/task-board";

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 md:px-6 md:py-12">
      <TaskBoard />
    </main>
  );
}
