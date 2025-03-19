import { useAuth } from "../../../supabase/auth";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function Header() {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <header className="bg-[#1E2836] text-white py-2 px-4 flex justify-between items-center fixed top-0 w-full z-50">
      <div>
        <img
          src="https://albroksa.com/wp-content/uploads/2022/11/logo_albrok_blanco_transp.png"
          alt="Albroksa Correduría de Seguros"
          className="w-[150px]"
        />
      </div>
      <Button
        onClick={handleLogout}
        className="bg-[#FF0000] hover:bg-[#cc0000] text-white"
      >
        Cerrar sesión
      </Button>
    </header>
  );
}
