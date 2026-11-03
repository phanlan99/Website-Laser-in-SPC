import Sidebar from "@/components/Sidebar";
import BackgroundLaser from "@/components/BackgroundLaser";

export default function Home() {
  return (
    <div className="min-h-screen lg:flex">
      <Sidebar />
      <main className="flex-1">
        <BackgroundLaser>
          
        </BackgroundLaser>
      </main>
    </div>
  );
}