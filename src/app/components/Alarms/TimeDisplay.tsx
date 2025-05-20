export default function TimeDisplay({ currentTime }: { currentTime: string }) {
  return (
    <div className="flex flex-col items-center justify-center w-full">
      <h1 className="text-5xl font-bold mb-4 text-center">{currentTime}</h1>
    </div>
  );
}
