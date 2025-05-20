import { useSession, signIn } from "next-auth/react";
import { Alarm } from "../../types";
import { AlarmClock } from "lucide-react";
import AlarmCard from "./AlarmCard";

export default function AlarmList({
  alarms,
  isLoading,
  onToggleAlarm,
  onRemoveAlarm,
}: {
  alarms: Alarm[];
  isLoading: boolean;
  onToggleAlarm: (index: number) => void;
  onRemoveAlarm: (index: number) => void;
}) {
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";

  return (
    <div className="w-full md:w-1/4 flex flex-col items-center justify-start gap-4 bg-gray-800 rounded-lg px-4 mb-4">
      <div className="w-full flex justify-between items-center py-4">
        <h2 className="text-xl font-bold flex items-center">
          <AlarmClock size={20} className="mr-2" /> Active Alarms
        </h2>
        {!isAuthenticated && (
          <div className="text-xs text-blue-400">
            <button
              onClick={() => signIn("google")}
              className="hover:underline"
            >
              Login to sync
            </button>
          </div>
        )}
      </div>
      <div className="flex-1 flex flex-col w-full overflow-y-auto max-h-[60vh] pr-2 rounded">
        {isLoading ? (
          <div className="text-center text-gray-400 py-4">
            Loading alarms...
          </div>
        ) : alarms.length === 0 ? (
          <div className="text-center text-gray-400 py-4">
            No alarms yet. Create one to get started!
          </div>
        ) : (
          alarms.map((alarm, index) => (
            <AlarmCard
              key={
                alarm._id ||
                `${alarm.hours}-${alarm.minutes}-${alarm.ampm}-${index}`
              }
              alarm={alarm}
              index={index}
              onToggle={() => onToggleAlarm(index)}
              onRemove={() => onRemoveAlarm(index)}
            />
          ))
        )}
      </div>
    </div>
  );
}
