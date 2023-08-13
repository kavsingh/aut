import { createRule } from "./evolver"

// rules from http://atlas.wolfram.com/01/01/
export const rule3 = createRule(["001", "000"])
export const rule18 = createRule(["100", "001"])
export const rule45 = createRule(["101", "011", "010", "000"])
export const rule57 = createRule(["101", "100", "011", "000"])
export const rule73 = createRule(["110", "011", "000"])
export const rule90 = createRule(["001", "100", "011", "001"])
export const rule160 = createRule(["111", "101"])
export const rule182 = createRule(["111", "101", "100", "010", "001"])
export const rule225 = createRule(["111", "110", "101", "000"])
