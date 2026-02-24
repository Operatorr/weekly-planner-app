import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

const COLOR_PRESETS = [
  { color: "#D4644A", name: "Ember" },
  { color: "#6B9B7A", name: "Sage" },
  { color: "#5B9BD5", name: "Sky" },
  { color: "#E5A84B", name: "Amber" },
  { color: "#9B6B9B", name: "Purple" },
  { color: "#E57B9B", name: "Pink" },
  { color: "#6B7280", name: "Gray" },
  { color: "#374151", name: "Dark" },
];

interface ColorPickerProps {
  value?: string;
  onChange: (color: string) => void;
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  return (
    <div className="grid grid-cols-4 gap-1.5 p-1">
      {COLOR_PRESETS.map(({ color, name }) => (
        <button
          key={color}
          onClick={() => onChange(color)}
          title={name}
          className={cn(
            "w-6 h-6 rounded-full flex items-center justify-center transition-transform hover:scale-110",
            value?.toLowerCase() === color.toLowerCase() && "ring-2 ring-offset-2 ring-ink/20"
          )}
          style={{ backgroundColor: color }}
        >
          {value?.toLowerCase() === color.toLowerCase() && (
            <Check size={12} className="text-white" strokeWidth={3} />
          )}
        </button>
      ))}
    </div>
  );
}

export { COLOR_PRESETS };
