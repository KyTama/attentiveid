import { motion } from 'framer-motion'
import { INTERACTIVE_SPRING } from '@/lib/motion'

interface ChoiceProps {
  name: string
  value: string
  checked: boolean
  onChange: (v: string) => void
  title: string
  desc: string
  hidden?: boolean
}

export function RadioChoice({ name, value, checked, onChange, title, desc, hidden }: ChoiceProps) {
  if (hidden) return null
  return (
    <motion.label
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.99 }}
      transition={INTERACTIVE_SPRING}
      className={`flex items-start gap-3 border rounded-[15px] p-4 cursor-pointer min-h-[78px] ${
        checked
          ? 'border-[#d8a74d] bg-[#fffcf4] shadow-[0_0_0_2px_rgba(216,167,77,.14)]'
          : 'border-[#ded7cc] bg-white hover:border-[#d6bd87] hover:shadow-sm'
      }`}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={() => onChange(value)}
        className="w-[17px] h-[17px] accent-[#d8a74d] mt-0.5 shrink-0"
      />
      <span>
        <strong className="block text-sm text-[#1c2b51]">{title}</strong>
        <small className="block text-[12.5px] text-[#6f7884] leading-[1.45] mt-1">{desc}</small>
      </span>
    </motion.label>
  )
}

export function FormField({
  id,
  label,
  required,
  children,
}: {
  id?: string
  label: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="mt-5">
      <label htmlFor={id} className="block mb-2 text-[13.5px] font-bold text-[#1c2b51]">
        {label} {required && <span className="text-[#d8a74d] font-black">*</span>}
      </label>
      {children}
    </div>
  )
}

export function TextInput({
  id,
  value,
  onChange,
  placeholder,
  type = 'text',
  inputMode,
  min,
  max,
  maxLength,
}: {
  id?: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
  inputMode?: 'tel' | 'numeric' | 'email' | 'text'
  min?: number
  max?: number
  maxLength?: number
}) {
  return (
    <input
      id={id}
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      maxLength={maxLength}
      inputMode={inputMode}
      min={min}
      max={max}
      className="w-full border border-[#ddd6ca] rounded-[13px] bg-white text-[#1c2b51] text-sm py-3 px-3.5 outline-none transition-colors focus:border-[#d8a74d] focus:shadow-[0_0_0_3px_rgba(216,167,77,.13)] focus:bg-[#fffefa] placeholder:text-[#96989b]"
    />
  )
}

export function SelectInput({
  id,
  value,
  onChange,
  options,
}: {
  id?: string
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full border border-[#ddd6ca] rounded-[13px] bg-white text-[#1c2b51] text-sm py-3 px-3.5 outline-none transition-colors focus:border-[#d8a74d] focus:shadow-[0_0_0_3px_rgba(216,167,77,.13)] focus:bg-[#fffefa]"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  )
}

export function TextArea({
  id,
  value,
  onChange,
  placeholder,
}: {
  id?: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <textarea
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full border border-[#ddd6ca] rounded-[13px] bg-white text-[#1c2b51] text-sm py-3 px-3.5 outline-none transition-colors focus:border-[#d8a74d] focus:shadow-[0_0_0_3px_rgba(216,167,77,.13)] focus:bg-[#fffefa] placeholder:text-[#96989b] min-h-[105px] resize-y"
    />
  )
}

export function Note({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-4 border-l-[3px] border-[#d8a74d] bg-[#f8f2e5] rounded-r-xl py-3 px-4 text-[#5f5a50] text-[13px] leading-relaxed">
      {children}
    </div>
  )
}

export function StepHeader({ eyebrow, title, lead }: { eyebrow: string; title: string; lead: string }) {
  return (
    <div className="border-t-[5px] border-[#d8a74d] px-5 sm:px-8 pt-7 pb-1.5">
      <div className="text-[#d8a74d] text-[11px] uppercase tracking-[.15em] font-extrabold mb-2">
        {eyebrow}
      </div>
      <h2 className="text-[#1c2b51] text-2xl sm:text-[30px] leading-[1.15] tracking-[-0.7px] font-bold">
        {title}
      </h2>
      <p className="mt-3 max-w-[640px] text-[#6f7884] text-[14.5px] leading-[1.7]">{lead}</p>
    </div>
  )
}

export function StepBody({ children }: { children: React.ReactNode }) {
  return <div className="px-5 sm:px-8 pt-2.5 pb-6 sm:pb-8">{children}</div>
}

export function Actions({ children }: { children: React.ReactNode }) {
  return <div className="flex justify-between items-center gap-3 mt-7">{children}</div>
}

export function PrimaryBtn({
  onClick,
  children,
  disabled,
}: {
  onClick?: () => void
  children: React.ReactNode
  disabled?: boolean
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      whileHover={disabled ? undefined : { y: -1 }}
      whileTap={disabled ? undefined : { scale: 0.98 }}
      transition={INTERACTIVE_SPRING}
      className="rounded-xl py-3 px-5 font-extrabold text-[13.5px] bg-[#d8a74d] text-[#1c2b51] shadow-[0_8px_18px_rgba(216,167,77,.24)] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
    >
      {children}
    </motion.button>
  )
}

export function SecondaryBtn({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.98 }}
      transition={INTERACTIVE_SPRING}
      className="rounded-xl py-3 px-5 font-extrabold text-[13.5px] bg-[#eeebe5] text-[#1c2b51] cursor-pointer"
    >
      {children}
    </motion.button>
  )
}
