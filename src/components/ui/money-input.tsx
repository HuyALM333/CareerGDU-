import * as React from "react"
import { Input } from "@/components/ui/input"

interface MoneyInputProps
    extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> {
    value?: number
    onChange: (value: number) => void
}

export const MoneyInput = React.forwardRef<HTMLInputElement, MoneyInputProps>(
    ({ className, value, onChange, ...props }, ref) => {
        // Format the numeric value to a string with dots (VN style)
        const formatValue = (val: number | undefined) => {
            if (val === undefined || val === null) return ""
            return new Intl.NumberFormat("vi-VN").format(val)
        }

        const [displayValue, setDisplayValue] = React.useState(formatValue(value))

        // Update display value when prop value changes (external update)
        React.useEffect(() => {
            setDisplayValue(formatValue(value))
        }, [value])

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const inputValue = e.target.value

            // Remove all non-digit characters
            const rawValue = inputValue.replace(/\D/g, "")

            // Convert to number
            const numericValue = rawValue === "" ? 0 : Number(rawValue)

            // Update parent with numeric value
            onChange(numericValue)

            // Update local display state
            // We don't use formatValue(numericValue) immediately here to avoid cursor jumping issues
            // But since we are formatting with grouping separators, cursor management is tricky.
            // For simplicity, let's just format it. Cursor jumping might happen but it's acceptable for now 
            // or we can just rely on the useEffect above if we want strictly controlled.
            // Actually, relying on useEffect might cause lag. Let's update directly.
            setDisplayValue(rawValue === "" ? "" : new Intl.NumberFormat("vi-VN").format(numericValue))
        }

        return (
            <Input
                type="text"
                inputMode="numeric"
                {...props}
                value={displayValue}
                onChange={handleChange}
                ref={ref}
            />
        )
    }
)
MoneyInput.displayName = "MoneyInput"
