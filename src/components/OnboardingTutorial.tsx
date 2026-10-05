import { useState } from 'react';
import {
  Search,
  FileText,
  Bell,
  MessageSquare,
  ArrowRight,
  Check,
  GraduationCap,
} from 'lucide-react';

interface OnboardingTutorialProps {
  onComplete: () => void;
}

const STEPS = [
  {
    icon: Search,
    title: 'Explora instituciones',
    description: 'Navega por el catalogo de instituciones educativas disponibles. Filtra por tipo de programa y encuentra la que mejor se adapte a tus objetivos.',
    color: 'from-[#3B82F6] to-[#2563EB]',
  },
  {
    icon: FileText,
    title: 'Envia tu postulacion',
    description: 'Completa el formulario con tus datos academicos y personales. Adjunta los documentos requeridos y envia tu postulacion en menos de 5 minutos.',
    color: 'from-[#2563EB] to-[#1D4ED8]',
  },
  {
    icon: Bell,
    title: 'Recibe notificaciones',
    description: 'Te avisaremos en tiempo real cuando una institucion revise tu postulacion. Recibiras una respuesta en 24 a 48 horas habiles.',
    color: 'from-[#1D4ED8] to-[#1E3A8A]',
  },
  {
    icon: MessageSquare,
    title: 'Chatea con instituciones',
    description: 'Comunicate directamente con las instituciones desde la plataforma. Resuelve dudas y coordina los siguientes pasos del proceso.',
    color: 'from-[#3B82F6] to-[#1D4ED8]',
  },
];

export function OnboardingTutorial({ onComplete }: OnboardingTutorialProps) {
  const [step, setStep] = useState(0);
  const isLast = step === STEPS.length - 1;
  const current = STEPS[step];

  const handleNext = () => {
    if (isLast) {
      onComplete();
    } else {
      setStep(step + 1);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#0F172A] flex flex-col">
      <div className="absolute inset-0 bg-gradient-to-br from-[#1E3A8A] via-[#2563EB] to-[#0F172A]" />
      <div className="absolute inset-0 opacity-[0.04]" style={{
        backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
        backgroundSize: '40px 40px',
      }} />

      {/* Skip button */}
      <div className="relative flex justify-end p-6">
        <button
          onClick={onComplete}
          className="text-white/60 hover:text-white text-sm font-medium transition-colors px-3 py-1.5 rounded-lg hover:bg-white/10"
        >
          Saltar
        </button>
      </div>

      {/* Content */}
      <div className="relative flex-1 flex flex-col items-center justify-center px-6 max-w-md mx-auto w-full">
        {/* Progress dots */}
        <div className="flex items-center gap-2 mb-12">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === step
                  ? 'w-8 bg-[#93C5FD]'
                  : i < step
                  ? 'w-2 bg-[#93C5FD]/60'
                  : 'w-2 bg-white/20'
              }`}
            />
          ))}
        </div>

        {/* Step icon */}
        <div className={`w-28 h-28 rounded-3xl bg-gradient-to-br ${current.color} flex items-center justify-center mb-8 shadow-2xl animate-scale-in`} style={{ boxShadow: '0 16px 48px rgba(37,99,235,0.4)' }}>
          <current.icon className="w-14 h-14 text-white" strokeWidth={1.5} />
        </div>

        {/* Step content */}
        <div key={step} className="text-center animate-fade-in">
          <h2 className="text-2xl font-bold text-white mb-4">{current.title}</h2>
          <p className="text-[#BFDBFE] leading-relaxed text-base">{current.description}</p>
        </div>
      </div>

      {/* Bottom actions */}
      <div className="relative px-6 pb-10 max-w-md mx-auto w-full" style={{ paddingBottom: 'max(2.5rem, env(safe-area-inset-bottom))' }}>
        <button
          onClick={handleNext}
          className="w-full py-4 bg-white text-[#2563EB] font-bold rounded-2xl transition-all shadow-2xl hover:bg-[#EFF6FF] hover:-translate-y-0.5 flex items-center justify-center gap-2 text-lg btn-spring"
        >
          {isLast ? (
            <>
              <Check className="w-5 h-5" />
              Comenzar a explorar
            </>
          ) : (
            <>
              Siguiente
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>

        {isLast && (
          <div className="mt-6 flex items-center justify-center gap-2 text-[#93C5FD]">
            <GraduationCap className="w-5 h-5" />
            <p className="text-sm font-medium">Estas listo para empezar tu proceso</p>
          </div>
        )}
      </div>
    </div>
  );
}
