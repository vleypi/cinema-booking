import { ITEM_DELAY_CLASSES, WORD_DELAY_CLASSES } from "@/shared/config";

const pickDelay = (classes: readonly string[], order: number): string => classes[Math.min(order, classes.length - 1)];

export const getWordDelayClassName = (order: number): string => pickDelay(WORD_DELAY_CLASSES, order);

export const getItemDelayClassName = (order: number): string => pickDelay(ITEM_DELAY_CLASSES, order);

export const splitWords = (text: string): string[] => text.split(" ");
