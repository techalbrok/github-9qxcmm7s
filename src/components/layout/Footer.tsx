export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#1E2836] text-white py-3 text-center text-[10px]">
      © {currentYear} Albroksa Correduría de Seguros. Diseñado y desarrollado
      por el Dto. de Tecnología de Albroksa Correduría de Seguros.
    </footer>
  );
}
