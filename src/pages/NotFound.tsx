import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import BackButton from "@/components/BackButton";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    // Alteramos de console.error para console.warn para ser menos agressivo no console
    console.warn(
      "404 Warning: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-tubepro-dark text-white">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl text-white/60 mb-6">Página não encontrada</p>
        <BackButton />
      </div>
    </div>
  );
};

export default NotFound;