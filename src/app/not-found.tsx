'use client'

import { motion } from 'framer-motion'

const AVATAR_URL =
  'https://api.dicebear.com/9.x/dylan/svg?seed=lost-explorer&hair=fluffy&skin=fog&backgroundColor=transparent'

export default function NotFound() {
  return (
    <main className="min-h-screen w-full bg-tl-bg-base flex flex-col items-center justify-center px-6 overflow-hidden relative">
      {/* Soft ambient glow */}
      <motion.div
        aria-hidden
        className="absolute -top-32 left-1/2 -translate-x-1/2 w-[60rem] h-[60rem] rounded-full bg-tl-gold/10 blur-[140px] pointer-events-none"
        animate={{ scale: [1, 1.05, 1], opacity: [0.6, 0.8, 0.6] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Avatar */}
      <motion.div
        initial={{ opacity: 0, scale: 0.85, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10"
      >
        <motion.img
          src={AVATAR_URL}
          alt=""
          width={208}
          height={208}
          className="w-44 h-44 sm:w-52 sm:h-52 rounded-full select-none"
          draggable={false}
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>

      {/* Big animated 404 */}
      <div
        className="relative z-10 mt-6 flex items-center gap-2 sm:gap-3 select-none"
        aria-label="404"
      >
        {['4', '0', '4'].map((digit, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0, y: 32, rotate: i === 1 ? -12 : 0 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            transition={{
              delay: 0.15 + i * 0.12,
              duration: 0.65,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="inline-block"
          >
            <motion.span
              animate={{
                y: [0, -10, 0],
                rotate: i === 1 ? [0, 8, -8, 0] : [0, 0],
              }}
              transition={{
                duration: i === 1 ? 5 : 4.2,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: i * 0.25,
              }}
              className="block font-display font-black tracking-tighter leading-none text-[8rem] sm:text-[12rem] md:text-[15rem]
                         bg-gradient-to-b from-tl-gold via-tl-gold/85 to-tl-gold/30
                         bg-clip-text text-transparent
                         drop-shadow-[0_8px_30px_rgba(201,168,76,0.25)]"
            >
              {digit}
            </motion.span>
          </motion.span>
        ))}
      </div>
    </main>
  )
}
