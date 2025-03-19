import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Settings,
  User,
  BarChart2,
  Users,
  FolderKanban,
  MessageSquare,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../supabase/auth";
import { motion } from "framer-motion";

export default function LandingPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const features = [
    {
      title: "Panel Interactivo",
      description:
        "Centro centralizado con métricas clave, gráficos interactivos y sistema de calificación de leads codificado por colores.",
      icon: <BarChart2 className="h-10 w-10 text-primary" />,
    },
    {
      title: "Pipeline Visual",
      description:
        "Interfaz de arrastrar y soltar con etapas personalizables para visualizar su embudo de ventas desde el contacto inicial hasta el cierre.",
      icon: <FolderKanban className="h-10 w-10 text-primary" />,
    },
    {
      title: "Gestión de Leads",
      description:
        "Perfiles completos de leads con datos personales, capacidad de inversión e historial completo de interacciones.",
      icon: <Users className="h-10 w-10 text-primary" />,
    },
    {
      title: "Centro de Comunicación",
      description:
        "Plantillas de correo electrónico, capacidades de programación, recordatorios de notificaciones y registro de comunicaciones.",
      icon: <MessageSquare className="h-10 w-10 text-primary" />,
    },
    {
      title: "Análisis Avanzado",
      description:
        "Informes personalizables con opciones de exportación, análisis de conversión y métricas de rendimiento.",
      icon: <TrendingUp className="h-10 w-10 text-primary" />,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      <header className="fixed top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between px-4 md:px-6">
          <div className="flex items-center space-x-4">
            <Link to="/" className="font-bold text-xl">
              CRM Franquicias de Seguros
            </Link>
          </div>
          <nav className="flex items-center space-x-2 md:space-x-4">
            {user ? (
              <div className="flex items-center gap-2 md:gap-4">
                <Link to="/dashboard">
                  <Button variant="ghost" className="text-sm md:text-base">
                    Panel
                  </Button>
                </Link>
                <Link to="/leads/dashboard">
                  <Button variant="ghost" className="text-sm md:text-base">
                    Leads
                  </Button>
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`}
                          alt={user.email || ""}
                        />
                        <AvatarFallback>
                          {user.email?.[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="hidden md:inline-block">
                        {user.email}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <User className="mr-2 h-4 w-4" />
                      Perfil
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Settings className="mr-2 h-4 w-4" />
                      Configuración
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onSelect={() => signOut()}>
                      Cerrar sesión
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" className="text-sm md:text-base">
                    Iniciar Sesión
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button className="text-sm md:text-base">Comenzar</Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="container mx-auto px-4 md:px-6 pt-24 pb-16">
          <div className="flex flex-col-reverse md:flex-row items-center justify-between gap-8 md:gap-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="flex-1 space-y-4 md:space-y-6"
            >
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                Optimiza tu Gestión de{" "}
                <span className="text-primary">Leads de Franquicias</span>
              </h1>

              <p className="text-lg md:text-xl text-muted-foreground">
                Una plataforma completa para seguir, calificar y convertir
                potenciales franquiciados con análisis potentes y gestión visual
                del pipeline.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                {!user ? (
                  <>
                    <Link to="/signup">
                      <Button size="lg" className="w-full sm:w-auto">
                        Prueba Gratuita
                      </Button>
                    </Link>
                    <Link to="/login">
                      <Button
                        size="lg"
                        variant="outline"
                        className="w-full sm:w-auto"
                      >
                        Iniciar Sesión
                      </Button>
                    </Link>
                  </>
                ) : (
                  <Link to="/leads/dashboard">
                    <Button size="lg">Ir al Panel</Button>
                  </Link>
                )}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex-1"
            >
              <img
                src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80"
                alt="Panel de Gestión de Leads"
                className="rounded-lg shadow-xl w-full"
              />
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-slate-50 py-16 md:py-20">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-12 md:mb-16">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                Funciones Potentes para la Gestión de Leads de Franquicias
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
                Todo lo que necesitas para seguir, calificar y convertir
                potenciales franquiciados
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="h-full hover:shadow-lg transition-shadow">
                    <CardContent className="p-4 md:p-6 flex flex-col items-center text-center">
                      <div className="mb-4 p-3 bg-primary/10 rounded-full">
                        {feature.icon}
                      </div>
                      <h3 className="text-lg md:text-xl font-semibold mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-sm md:text-base text-muted-foreground">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 md:py-20 bg-gradient-to-r from-primary/5 to-primary/10">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center"
              >
                <p className="text-3xl md:text-4xl font-bold text-primary mb-2">
                  30%
                </p>
                <p className="text-base md:text-lg font-medium">
                  Aumento en Conversión de Leads
                </p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-center"
              >
                <p className="text-3xl md:text-4xl font-bold text-primary mb-2">
                  50%
                </p>
                <p className="text-base md:text-lg font-medium">
                  Menos Tiempo en Tareas Administrativas
                </p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-center"
              >
                <p className="text-3xl md:text-4xl font-bold text-primary mb-2">
                  100%
                </p>
                <p className="text-base md:text-lg font-medium">
                  Visibilidad del Pipeline de Ventas
                </p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="text-center"
              >
                <p className="text-3xl md:text-4xl font-bold text-primary mb-2">
                  24/7
                </p>
                <p className="text-base md:text-lg font-medium">
                  Acceso a Datos de Leads
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-20 bg-primary text-white">
          <div className="container mx-auto px-4 md:px-6 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">
              ¿Listo para Transformar tu Gestión de Leads de Franquicias?
            </h2>
            <p className="text-lg md:text-xl mb-6 md:mb-8 max-w-2xl mx-auto">
              Únete a cientos de negocios de franquicias que ya utilizan nuestra
              plataforma para hacer crecer su red.
            </p>
            {!user ? (
              <Link to="/signup">
                <Button size="lg" variant="secondary">
                  Comienza tu Prueba Gratuita
                </Button>
              </Link>
            ) : (
              <Link to="/leads/dashboard">
                <Button size="lg" variant="secondary">
                  Ir al Panel
                </Button>
              </Link>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-background py-10 md:py-12 border-t">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <h3 className="text-xl font-bold">CRM Franquicias de Seguros</h3>
              <p className="text-muted-foreground mt-2">
                Optimizando la gestión de leads de franquicias
              </p>
            </div>
            <div className="flex flex-col md:flex-row gap-8">
              <div>
                <h4 className="font-semibold mb-3">Producto</h4>
                <ul className="space-y-2">
                  <li>
                    <a
                      href="#"
                      className="text-muted-foreground hover:text-primary"
                    >
                      Características
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-muted-foreground hover:text-primary"
                    >
                      Precios
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-muted-foreground hover:text-primary"
                    >
                      Testimonios
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Recursos</h4>
                <ul className="space-y-2">
                  <li>
                    <a
                      href="#"
                      className="text-muted-foreground hover:text-primary"
                    >
                      Documentación
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-muted-foreground hover:text-primary"
                    >
                      Blog
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-muted-foreground hover:text-primary"
                    >
                      Soporte
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Empresa</h4>
                <ul className="space-y-2">
                  <li>
                    <a
                      href="#"
                      className="text-muted-foreground hover:text-primary"
                    >
                      Acerca de
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-muted-foreground hover:text-primary"
                    >
                      Carreras
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-muted-foreground hover:text-primary"
                    >
                      Contacto
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="border-t mt-10 md:mt-12 pt-6 md:pt-8 text-center text-muted-foreground">
            <p>
              &copy; {new Date().getFullYear()} CRM Franquicias de Seguros.
              Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
