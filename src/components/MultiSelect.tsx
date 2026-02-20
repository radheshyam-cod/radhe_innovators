import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { XIcon, ChevronDownIcon, CheckIcon } from 'lucide-react'

interface Option {
    value: string;
    label: string;
}

interface MultiSelectProps {
    options: Option[];
    selectedValues: string[];
    onChange: (values: string[]) => void;
    placeholder?: string;
}

export default function MultiSelect({ options, selectedValues, onChange, placeholder = "Select options..." }: MultiSelectProps) {
    const [isOpen, setIsOpen] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)

    // Close dropdown on outside click
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    const toggleOption = (value: string) => {
        const newValues = selectedValues.includes(value)
            ? selectedValues.filter(v => v !== value)
            : [...selectedValues, value]
        onChange(newValues)
    }

    const removeOption = (e: React.MouseEvent, value: string) => {
        e.stopPropagation()
        onChange(selectedValues.filter(v => v !== value))
    }

    return (
        <div className="relative w-full" ref={containerRef}>
            <div
                className="min-h-[42px] px-3 py-2 bg-black/50 border border-gray-700 rounded-lg cursor-pointer flex items-center justify-between gap-2 hover:border-[#39FF14] transition-colors"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="flex flex-wrap gap-2 flex-grow">
                    {selectedValues.length === 0 ? (
                        <span className="text-gray-500">{placeholder}</span>
                    ) : (
                        selectedValues.map(val => {
                            const option = options.find(o => o.value === val)
                            return (
                                <span
                                    key={val}
                                    className="inline-flex items-center gap-1 px-2 py-1 bg-[#39FF14]/20 text-[#39FF14] text-xs font-semibold rounded-md border border-[#39FF14]/30"
                                >
                                    {option?.label || val}
                                    <XIcon
                                        className="w-3 h-3 cursor-pointer hover:text-white transition-colors"
                                        onClick={(e) => removeOption(e, val)}
                                    />
                                </span>
                            )
                        })
                    )}
                </div>
                <ChevronDownIcon className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute z-50 w-full mt-2 bg-[#1A1A1A] border border-gray-700 rounded-lg shadow-xl overflow-hidden"
                    >
                        <div className="max-h-60 overflow-y-auto pattern-bg">
                            {options.map(option => {
                                const isSelected = selectedValues.includes(option.value)
                                return (
                                    <div
                                        key={option.value}
                                        onClick={() => toggleOption(option.value)}
                                        className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-white/5 transition-colors"
                                    >
                                        <span className={isSelected ? 'text-[#39FF14] font-medium' : 'text-gray-300'}>
                                            {option.label}
                                        </span>
                                        {isSelected && <CheckIcon className="w-4 h-4 text-[#39FF14]" />}
                                    </div>
                                )
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
