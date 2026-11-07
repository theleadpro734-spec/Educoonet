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
    color: 'from-brand-500 to-brand-600',
  },
  {
    icon: FileText,
    title: 'Envia tu postulacion',
    description: 'Completa el formulario con tus datos academicos y personales. Adjunta los documentos requeridos y envia tu postulacion en menos de 5 minutos.',
    color: 'from-brand-600 to-brand-700',
  },
  {
    icon: Bell,
    title: 'Recibe notificaciones',
    description: 'Te avisaremos en tiempo real cuando una institucion revise tu postulacion. Recibiras una respuesta en 24 a 48 horas habiles.',
    color: 'from-brand-700 to-brand-900',
  },
  {
    icon: MessageSquare,
    title: 'Chatea con instituciones',
    description: 'Comunicate directamente con las instituciones desde la plataforma. Resuelve dudas y coordina los siguientes pasos del proceso.',
    color: 'from-brand-500 to-brand-700',
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
      <div className="absolute inset-0 bg-gradient-to-br from-brand-900 via-brand-600 to-[#0F172A]" />
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
                  ? 'w-8 bg-brand-300'
                  : i < step
                  ? 'w-2 bg-brand-300/60'
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
          <p className="text-brand-200 leading-relaxed text-base">{current.description}</p>
        </div>
      </div>

      {/* Bottom actions */}
      <div className="relative px-6 pb-10 max-w-md mx-auto w-full" style={{ paddingBottom: 'max(2.5rem, env(safe-area-inset-bottom))' }}>
        <button
          onClick={handleNext}
          className="w-full py-4 bg-white text-brand-600 font-bold rounded-2xl transition-all shadow-2xl hover:bg-brand-50 hover:-translate-y-0.5 flex items-center justify-center gap-2 text-lg btn-spring"
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
          <div className="mt-6 flex items-center justify-center gap-2 text-brand-300">
            <GraduationCap className="w-5 h-5" />
            <p className="text-sm font-medium">Estas listo para empezar tu proceso</p>
          </div>
        )}
      </div>
    </div>
  );
}
