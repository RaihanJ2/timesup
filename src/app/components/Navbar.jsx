"use client";
import { Siren } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { FaGoogle } from "react-icons/fa6";
import { signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";

const Navbar = () => {
  const { data: session } = useSession();

  const handleGoogleSignIn = async (e) => {
    e.preventDefault();
    await signIn("google", { callbackUrl: "/" });
  };

  const handleSignOut = async (e) => {
    e.preventDefault();
    await signOut({ callbackUrl: "/" });
    localStorage.removeItem(localStorageKey);
  };

  return (
    <nav className="bg-gray-700 shadow-md p-4 transition-colors duration-300">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.5,
            ease: "easeOut",
          }}
          className="flex items-center justify-between"
        >
          <Link href="/" className="flex items-center gap-1">
            <Siren
              size={32}
              absoluteStrokeWidth
              className="h-6 w-6 mb-2 text-blue-500"
            />
            <span className="text-xl font-bold text-gray-100">Timesup!</span>
          </Link>

          <ul className="flex items-center space-x-4">
            <li>
              <Link
                href="/Timer"
                className="px-4 py-2 rounded-md text-gray-100 hover:bg-gray-500 transition-colors duration-200"
              >
                Timer
              </Link>
            </li>
            <li>
              <Link
                href="/Stopwatch"
                className="px-4 py-2 rounded-md text-gray-100 hover:bg-gray-500 transition-colors duration-200"
              >
                Stopwatch
              </Link>
            </li>
            <li>
              <Link
                href="/Alarm"
                className="px-4 py-2 rounded-md text-gray-100 hover:bg-gray-500 transition-colors duration-200"
              >
                Alarm
              </Link>
            </li>

            {session ? (
              <li className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  {session.user.image && (
                    <div className="w-8 h-8 rounded-full overflow-hidden">
                      <Image
                        src={session.user.image}
                        alt={session.user.name || "User"}
                        width={32}
                        height={32}
                      />
                    </div>
                  )}
                </div>
                <button
                  onClick={handleSignOut}
                  className="cursor-pointer px-4 py-2 rounded-md text-gray-100 bg-gray-700 hover:bg-gray-600 transition-colors duration-200"
                >
                  Logout
                </button>
              </li>
            ) : (
              <li>
                <button
                  onClick={handleGoogleSignIn}
                  className="cursor-pointer flex flex-row items-center gap-2 p-2 rounded-md text-gray-100 bg-gray-800 hover:bg-gray-500 transition-colors duration-200"
                >
                  <FaGoogle /> Login with Google
                </button>
              </li>
            )}
          </ul>
        </motion.div>
      </div>
    </nav>
  );
};

export default Navbar;
