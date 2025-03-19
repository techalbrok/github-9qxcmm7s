import { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="max-w-md w-full px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">CRM Franquicias de Seguros</h1>
          <p className="text-slate-600 mt-2">
            Gestiona tus leads de franquicias de manera eficiente
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
