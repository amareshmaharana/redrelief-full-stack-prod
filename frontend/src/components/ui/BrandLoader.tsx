import { motion } from 'framer-motion';

interface BrandLoaderProps {
  /** Optional message below the logo */
  message?: string;
  /** Use full-screen centered layout (default: true) */
  fullScreen?: boolean;
}

export function BrandLoader({ message = 'Preparing your experience...', fullScreen = true }: BrandLoaderProps) {
  const Wrapper = fullScreen ? FullScreenWrapper : InlineWrapper;

  return (
    <Wrapper>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="flex flex-col items-center gap-5"
      >
        {/* Logo with pulse ring */}
        <div className="relative">
          {/* Outer pulsing ring */}
          <motion.div
            className="absolute inset-0 rounded-full bg-primary/20"
            animate={{ scale: [1, 1.5, 1], opacity: [0.4, 0, 0.4] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            style={{ width: 72, height: 72, top: -4, left: -4 }}
          />
          {/* Inner glow */}
          <motion.div
            className="absolute inset-0 rounded-full bg-primary/10"
            animate={{ scale: [1, 1.25, 1], opacity: [0.6, 0.1, 0.6] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
            style={{ width: 72, height: 72, top: -4, left: -4 }}
          />
          {/* Logo */}
          <motion.img
            src="/bdms-logo.png"
            alt="RedRelief"
            className="relative z-10 h-16 w-16 object-contain drop-shadow-lg"
            animate={{ rotate: [0, 3, -3, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>

        {/* Brand name */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="text-center"
        >
          <h2 className="font-display text-2xl font-bold tracking-tight">
            Red<span className="text-primary">Relief</span>
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">{message}</p>
        </motion.div>

        {/* Loading dots */}
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="h-2 w-2 rounded-full bg-primary"
              animate={{ scale: [1, 1.4, 1], opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1, repeat: Infinity, delay: i * 0.2, ease: 'easeInOut' }}
            />
          ))}
        </div>
      </motion.div>
    </Wrapper>
  );
}

function FullScreenWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      {children}
    </div>
  );
}

function InlineWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-center py-20">
      {children}
    </div>
  );
}
