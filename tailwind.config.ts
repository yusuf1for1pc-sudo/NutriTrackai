import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				glass: {
					DEFAULT: 'hsl(var(--glass))',
					foreground: 'hsl(var(--glass-foreground))',
					border: 'hsl(var(--glass-border))'
				},
				hp: {
					DEFAULT: 'hsl(var(--hp-red))',
					foreground: 'hsl(var(--hp-red-foreground))'
				},
				stamina: {
					DEFAULT: 'hsl(var(--stamina-yellow))',
					foreground: 'hsl(var(--stamina-yellow-foreground))'
				},
				strength: {
					DEFAULT: 'hsl(var(--strength-green))',
					foreground: 'hsl(var(--strength-green-foreground))'
				},
				defense: {
					DEFAULT: 'hsl(var(--defense-blue))',
					foreground: 'hsl(var(--defense-blue-foreground))'
				}
			},
			backgroundImage: {
				'gradient-glass': 'var(--gradient-glass)',
				'gradient-primary': 'var(--gradient-primary)',
				'gradient-hp': 'var(--gradient-hp)',
				'gradient-stamina': 'var(--gradient-stamina)',
				'gradient-strength': 'var(--gradient-strength)',
				'gradient-defense': 'var(--gradient-defense)'
			},
			boxShadow: {
				'glass': 'var(--shadow-glass)',
				'glow': 'var(--shadow-glow)',
				'hp-glow': 'var(--shadow-hp-glow)',
				'stamina-glow': 'var(--shadow-stamina-glow)',
				'strength-glow': 'var(--shadow-strength-glow)',
				'defense-glow': 'var(--shadow-defense-glow)'
			},
			backdropBlur: {
				'glass': '16px'
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'fade-in': {
					'0%': {
						opacity: '0',
						transform: 'translateY(10px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				'scale-in': {
					'0%': {
						transform: 'scale(0.95)',
						opacity: '0'
					},
					'100%': {
						transform: 'scale(1)',
						opacity: '1'
					}
				},
				'glow-pulse': {
					'0%, 100%': {
						boxShadow: 'var(--shadow-glow)'
					},
					'50%': {
						boxShadow: '0 0 60px -10px hsl(var(--primary) / 0.5)'
					}
				},
				'confetti': {
					'0%': {
						transform: 'translateY(0) rotate(0deg) scale(1)',
						opacity: '1'
					},
					'100%': {
						transform: 'translateY(-100vh) rotate(360deg) scale(0)',
						opacity: '0'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.3s ease-out',
				'scale-in': 'scale-in 0.2s ease-out',
				'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
				'confetti': 'confetti 1s ease-out'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
