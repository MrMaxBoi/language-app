export type TracePoint = readonly [number, number];

export type KanaTraceDefinition = {
  character: string;
  viewBoxSize: number;
  strokes: readonly {
    points: readonly TracePoint[];
  }[];
};

// Median paths adapted from AnimCJK kana SVGs. See THIRD_PARTY_NOTICES.md.
export const KANA_TRACING: Record<string, KanaTraceDefinition> = {
  'hiragana-a': {
    character: 'あ',
    viewBoxSize: 1024,
    strokes: [
      { points: [[174, 258], [251, 308], [440, 306], [697, 241]] },
      { points: [[331, 137], [420, 185], [373, 388], [367, 632], [409, 728], [431, 777]] },
      {
        points: [
          [570, 440], [610, 484], [460, 727], [200, 836], [181, 682], [342, 556], [466, 514],
          [641, 499], [754, 520], [838, 606], [845, 763], [703, 869], [508, 922],
        ],
      },
    ],
  },
  'hiragana-i': {
    character: 'い',
    viewBoxSize: 1024,
    strokes: [
      { points: [[95, 249], [149, 282], [222, 589], [272, 704], [369, 788], [372, 702], [406, 628]] },
      { points: [[678, 273], [754, 342], [836, 472], [867, 639]] },
    ],
  },
  'hiragana-u': {
    character: 'う',
    viewBoxSize: 1024,
    strokes: [
      { points: [[400, 113], [654, 205]] },
      { points: [[213, 423], [286, 450], [494, 372], [610, 360], [684, 394], [718, 462], [672, 690], [492, 911]] },
    ],
  },
  'hiragana-e': {
    character: 'え',
    viewBoxSize: 1024,
    strokes: [
      { points: [[400, 113], [654, 205]] },
      {
        points: [
          [197, 436], [277, 460], [618, 334], [654, 363], [608, 380], [203, 762], [204, 804],
          [333, 709], [407, 692], [482, 722], [596, 836], [793, 835], [855, 853],
        ],
      },
    ],
  },
  'hiragana-o': {
    character: 'お',
    viewBoxSize: 1024,
    strokes: [
      { points: [[112, 323], [174, 364], [327, 362], [535, 309]] },
      {
        points: [
          [287, 100], [338, 140], [311, 847], [282, 898], [234, 906], [218, 900], [165, 836],
          [158, 764], [243, 671], [525, 536], [748, 543], [835, 691], [763, 820], [588, 917],
        ],
      },
      { points: [[710, 189], [794, 229], [868, 350]] },
    ],
  },
};
