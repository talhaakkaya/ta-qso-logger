import { Month } from "@/types";

export const ROWS_PER_PAGE = 25;

export const MONTHS: Month[] = [
  { value: "01", label: "Ocak" },
  { value: "02", label: "Şubat" },
  { value: "03", label: "Mart" },
  { value: "04", label: "Nisan" },
  { value: "05", label: "Mayıs" },
  { value: "06", label: "Haziran" },
  { value: "07", label: "Temmuz" },
  { value: "08", label: "Ağustos" },
  { value: "09", label: "Eylül" },
  { value: "10", label: "Ekim" },
  { value: "11", label: "Kasım" },
  { value: "12", label: "Aralık" },
];

export const MODES = ["", "Analog", "Digital", "HF", "Diğer"] as const;

export const QRZ_OPTIONS = ["Yok", "Var"] as const;

export const STORAGE_KEYS = {
  QSO_DATA: "amatorTelsizLog",
  SEARCH_HISTORY: "searchHistory",
  LAST_CSV_FILENAME: "lastCsvFileName",
  LAST_BACKUP_DATE: "lastBackupDate",
} as const;

export const Q_CODES: Record<string, string> = {
  QRA: "What is the name of your station?\nQRA The name of my station is ……….",
  QRB: "How far are you from my station?\nQRB I am ____ km from your station.",
  QRD: "Where are you going and where are you coming from?\nQRD I am going to ____, I am coming from ____.",
  QRG: "Will you tell me my exact frequency?\nQRG Your exact frequency is _______",
  QRH: "Does my frequency vary?\nQRH Yes, your frequency varies.\nQRH Does my frequency vary?",
  QRI: "How is the tone of my transmission? (T in RST)\nQRI The tone of your transmission is 1(good), 2(variable), 3(bad)",
  QRK: "What is the intelligibility/readability of my signals? (R in RST)\nQRK The intelligibility of your signals is 1(bad), 2(poor), 3(fair), 4(good), 5(excellent)",
  QRL: "Are you busy?\nQRL I am busy.",
  QRM: "Is my transmission being interfered with?\nQRM Your transmission is being interfered with 1(nil), 2(slightly), 3(moderately), 4(severely), 5(extremely)",
  QRN: "Are you troubled by static?\nQRN I am troubled by static 1(nil), 2(slightly), 3(moderately), 4(severely), 5(extremely)",
  QRO: "Shall I increase power?\nQRO Yes, increase power.",
  QRP: "Shall I decrease power?\nQRP Yes, decrease power",
  QRQ: "Shall I send faster?\nQRQ Yes, send faster",
  QRS: "Shall I send more slowly?\nQRS Yes, send more slowly",
  QRT: "Shall I stop sending?\nQRT Yes, stop sending",
  QRU: "Have you anything for me?\nQRU I have nothing for you",
  QRV: "Are you ready?\nQRV I am ready",
  QRW: "Shall I inform ____ that you are calling him on ____ kHz?\nQRW Yes, please inform ____ that I am calling him on ____ kHz",
  QRX: "When will you call me again?\nQRX I will call you again at ____ hours on ____ kHz",
  QRY: "What is my turn?\nQRY Your turn is number ____",
  QRZ: "Who is calling me?\nQRZ You are being called by ____",
  QSA: "What is the strength of my signals?\nQSA The strength of your signals is S1 – S9",
  QSB: "Are my signals fading?\nQSB Yes, your signals are fading",
  QSD: "Is my keying defective?\nQSD Yes, your keying is defective",
  QSI: "I cannot break in; please advise ____ that I am calling on ____ kHz",
  QSK: "Can you hear me between your signals?\nQSK Yes, I can hear you between my signals, you can break in",
  QSL: "Can you acknowledge receipt?\nQSL I can acknowledge receipt",
  QSN: "Did you hear me (or ____) on ____ kHz?\nQSN I did hear you (or ____) on ____ kHz",
  QSO: "Can you communicate with ____ direct or by relay?\nQSO I can communicate with ____ direct (or by relay through ____)",
  QSP: "Will you relay to ____?\nQSP I will relay to ____",
  QSR: "Do you want me to repeat my call?\nQSR Yes, repeat your call; I did not hear you",
  QSS: "What working frequency will you use?\nQSS I will use working frequency ____ kHz",
  QST: "General call preceding a message addressed to all amateurs",
  QSU: "Shall I send or reply on this frequency?\nQSU Send or reply on this frequency (or on ____ kHz)",
  QSV: "Shall I send a series of Vs?\nQSV Send a series of Vs",
  QSW: "Will you send on this frequency?\nQSW I will send on this frequency (or on ____ kHz)",
  QSX: "Will you listen to ____ on ____ kHz?\nQSX I am listening to ____ on ____ kHz",
  QSY: "Shall I change to another frequency?\nQSY Change to another frequency (or to ____ kHz)",
  QSZ: "Shall I send each word or group more than once?\nQSZ Send each word or group twice (or ____ times)",
  QTA: "Shall I cancel message number ____?\nQTA Cancel message number ____",
  QTB: "Do you agree with my counting of words?\nQTB I do not agree with your counting of words; I will repeat the first letter or digit of each word or group",
  QTC: "How many messages have you to send?\nQTC I have ____ messages for you (or for ____)",
  QTH: "What is your location?\nQTH My location is ____",
  QTR: "What is the correct time?\nQTR The time is ____",
};
