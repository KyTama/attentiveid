import { type ReactNode, type HTMLAttributes, useRef, useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface AnimatedSectionProps extends HTMLAttributes<HTMLDivElement> {
    children: ReactNode
    delay?: 'none' | '100' | '200' | '300' | '400'
    animation?: 'fade-up' | 'fade-in'
}

export function AnimatedSection({
    children,
    delay = 'none',
    animation = 'fade-up',
    className,
    ...props
}: AnimatedSectionProps) {
    const ref = useRef<HTMLDivElement>(null)
    const [isInView, setIsInView] = useState(false)

    useEffect(() => {
        const element = ref.current
        if (!element) return

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsInView(true)
                    observer.unobserve(element)
                }
            },
            { threshold: 0.1 }
        )

        observer.observe(element)

        return () => observer.disconnect()
    }, [])

    const delayMap = {
        none: '',
        '100': 'delay-100',
        '200': 'delay-200',
        '300': 'delay-300',
        '400': 'delay-400',
    }

    const animationMap = {
        'fade-up': 'animate-fade-in-up',
        'fade-in': 'animate-fade-in',
    }

    return (
        <div
            ref={ref}
            className={cn(
                'opacity-0',
                isInView && [animationMap[animation], delayMap[delay]],
                className
            )}
            {...props}
        >
            {children}
        </div>
    )
}

