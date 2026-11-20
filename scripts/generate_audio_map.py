#!/usr/bin/env python3
import os

def generate_audio_map(audio_dir="mobile/assets/audio", output_file="mobile/src/services/audioMap.ts"):
    lines = [
        "// Auto-generated audio map for 701 Gita verses",
        "export const AUDIO_MAP: Record<string, any> = {"
    ]
    count = 0
    for ch in range(1, 19):
        ch_dir = os.path.join(audio_dir, str(ch))
        if os.path.exists(ch_dir):
            verses = sorted([int(f.split('.')[0]) for f in os.listdir(ch_dir) if f.endswith('.mp3')])
            for v in verses:
                lines.append(f'  "{ch}_{v}": require("../../assets/audio/{ch}/{v}.mp3"),')
                count += 1
    lines.append("};")
    lines.append("")
    lines.append("export function getAudioSource(chapterNumber: number, verseNumber: number): any {")
    lines.append('  const key = `${chapterNumber}_${verseNumber}`;')
    lines.append("  return AUDIO_MAP[key] || null;")
    lines.append("}")
    lines.append("")

    with open(output_file, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))

    print(f"Successfully generated {output_file} with {count} audio tracks mapped.")

if __name__ == "__main__":
    generate_audio_map()
