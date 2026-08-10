/** Scientific foundation content for Brain Mapping deep-dive modal */
export const EMBRYOLOGY_SECTIONS = [
  {
    id: 'intro',
    tone: 'amber',
    title: 'From Conception to Birth: The Science Behind Brain Development, Fingerprints & Dermatoglyphics',
    paragraphs: [],
  },
  {
    id: 'week0',
    tone: 'orange',
    title: '1. Fertilization (Week 0)',
    paragraphs: [
      'Human life begins when a sperm fertilizes an egg, forming a zygote. This single cell contains the complete genetic blueprint (DNA) required to develop every organ, tissue, and system of the body.',
      'The zygote undergoes rapid cell division (cleavage), forming a morula and then a blastocyst, which implants into the uterus about 6–7 days after fertilization.',
    ],
  },
  {
    id: 'week2',
    tone: 'purple',
    title: '2. Formation of the Embryo (Week 2)',
    paragraphs: [
      'After implantation, the embryo begins organizing into specialized tissues that will eventually develop into every organ of the human body.',
      'Although the embryo is only a tiny cluster of cells, the foundation for every future organ system has already been established.',
    ],
  },
  {
    id: 'week3',
    tone: 'green',
    title: '3. Gastrulation – Formation of the Three Germ Layers (Week 3)',
    paragraphs: ['One of the most important stages of embryonic development is Gastrulation. During this stage, the embryo differentiates into three primary germ layers, from which every tissue and organ develops.'],
    subtitle: 'A. Ectoderm (Outer Layer)',
    bullets: ['Brain', 'Spinal Cord', 'Entire Nervous System', 'Retina', 'Peripheral Nerves', 'Epidermis (Outer Skin)', 'Hair', 'Nails', 'Sweat Glands', 'Fingerprint Ridges'],
  },
  {
    id: 'mesoderm',
    tone: 'blue',
    subtitle: 'B. Mesoderm (Middle Layer)',
    bullets: ['Bones', 'Muscles', 'Heart', 'Blood', 'Kidneys', 'Connective Tissue', 'Reproductive Organs'],
  },
  {
    id: 'endoderm',
    tone: 'yellow',
    subtitle: 'C. Endoderm (Inner Layer)',
    bullets: ['Lungs', 'Liver', 'Pancreas', 'Stomach', 'Intestines', 'Thyroid', 'Urinary Bladder Lining'],
  },
  {
    id: 'link',
    tone: 'amber',
    title: '4. The Embryological Link Between the Brain and Fingerprints',
    paragraphs: [
      'The scientific basis most often discussed in dermatoglyphics begins with the ectoderm.',
      'The ectoderm differentiates into two specialized tissues:',
    ],
    subtitle: 'Surface Ectoderm',
    bullets: ['Epidermis (outer skin)', 'Hair', 'Nails', 'Sweat Glands', 'Fingerprint Ridges'],
  },
  {
    id: 'neuroectoderm',
    tone: 'purple',
    subtitle: 'Neuroectoderm',
    bullets: ['Neural Plate', 'Neural Tube', 'Brain', 'Spinal Cord', 'Central Nervous System'],
    paragraphs: ['Although fingerprints and the brain become completely different structures, both originate from the same embryonic tissue (ectoderm). This common embryological origin is the biological relationship between fingerprints and the brain.'],
  },
  {
    id: 'neurulation',
    tone: 'green',
    title: '5. Neurulation – Formation of the Neural Tube (Week 3–4)',
    paragraphs: [
      'The neuroectoderm thickens to form the Neural Plate. The neural plate folds inward to create the Neural Groove. The edges then fuse together, forming the Neural Tube.',
      'The Neural Tube later develops into: Forebrain, Midbrain, Hindbrain, and Spinal Cord. Every neuron in the human body ultimately originates from this neural tube.',
    ],
  },
  {
    id: 'neurogenesis',
    tone: 'orange',
    title: '6. Neurogenesis – Birth of Neurons (Week 5 onwards)',
    paragraphs: [
      'Special neural stem cells begin dividing rapidly. This process is called Neurogenesis.',
      'During peak fetal development, approximately 250,000 neurons may be produced every minute (estimated peak rate). Eventually, the human brain contains approximately 86 billion neurons.',
      'At this stage, neurons have been created but have not yet reached their permanent destinations.',
    ],
  },
  {
    id: 'migration',
    tone: 'blue',
    title: '7. Neuronal Migration',
    paragraphs: [
      'Once neurons are formed, they begin traveling toward their genetically programmed destinations. This process is called Neuronal Migration.',
      'Neurons migrate using specialized support cells called Radial Glial Cells, which act like biological scaffolding or guide rails. Each neuron carries molecular signals that direct it to a specific location in the developing brain.',
    ],
    bullets: ['Motor-related neurons migrate toward the frontal cortex.', 'Visual-processing neurons migrate toward the occipital cortex.', 'Auditory and language-related neurons migrate toward the temporal cortex.', 'Sensory-processing neurons migrate toward the parietal cortex.'],
  },
  {
    id: 'lobes',
    tone: 'purple',
    title: '8. Formation of the Cerebral Lobes',
    paragraphs: ['As neurons reach their destinations, the cerebral cortex organizes into specialized functional regions.'],
    subtitle: 'Prefrontal Cortex',
    bullets: ['Planning', 'Decision Making', 'Executive Function', 'Goal Setting', 'Working Memory', 'Attention', 'Emotional Regulation', 'Self-Control', 'Personality'],
    paragraphs: ['Often referred to as the brain\'s Executive Control Center.'],
  },
  {
    id: 'frontal',
    tone: 'green',
    subtitle: 'Frontal Lobe',
    bullets: ['Voluntary Movement', 'Motor Control', 'Problem Solving', 'Judgement', 'Creativity', 'Speech Production (Broca\'s Area)'],
  },
  {
    id: 'parietal',
    tone: 'amber',
    subtitle: 'Parietal Lobe',
    bullets: ['Touch', 'Pressure', 'Pain', 'Temperature', 'Body Awareness', 'Spatial Intelligence', 'Mathematical Reasoning', 'Hand-Eye Coordination'],
    paragraphs: ['Contains the Primary Somatosensory Cortex.'],
  },
  {
    id: 'temporal',
    tone: 'orange',
    subtitle: 'Temporal Lobe',
    bullets: ['Hearing', 'Language Comprehension', 'Memory', 'Emotion', 'Music Processing', 'Face Recognition', 'Hippocampus', 'Amygdala'],
  },
  {
    id: 'occipital',
    tone: 'blue',
    subtitle: 'Occipital Lobe',
    bullets: ['Vision', 'Color Recognition', 'Motion Detection', 'Shape Recognition', 'Object Recognition'],
    paragraphs: ['Contains the Primary Visual Cortex.'],
  },
  {
    id: 'lobes-move',
    tone: 'yellow',
    title: '9. Do Neurons Continue Moving Between Lobes?',
    paragraphs: [
      'No. Neuronal migration occurs primarily during fetal development. Once neurons reach their designated brain region, they generally remain in that region throughout life.',
      'For example, a neuron that develops within the frontal cortex does not normally migrate to the temporal or occipital cortex later in life.',
    ],
  },
  {
    id: 'plasticity',
    tone: 'purple',
    title: '10. What Actually Changes Throughout Life?',
    paragraphs: [
      'Although neurons generally remain in the same brain region, their connections continuously change. This ability is known as Neuroplasticity.',
      'The brain constantly forms new neural connections, strengthens frequently used pathways, weakens unused pathways, and reorganizes functional networks.',
      'Therefore, neurons usually stay in place, while their communication networks continue to evolve throughout life.',
    ],
  },
  {
    id: 'synaptogenesis',
    tone: 'green',
    title: '11. Synaptogenesis',
    paragraphs: [
      'Once neurons reach their destination, they begin connecting with one another. These connections are called Synapses. A single neuron can communicate with thousands of other neurons.',
      'These neural networks form the basis of learning, memory, language, thinking, decision making, emotions, and motor control.',
    ],
  },
  {
    id: 'week13',
    tone: 'amber',
    title: '12. Simultaneous Development of the Brain and Fingerprints (Week 13–19)',
    paragraphs: ['Between approximately 13 and 19 weeks of gestation, the fetus undergoes rapid and simultaneous development of both the brain and the fingertips.'],
    subtitle: 'Brain Development',
    bullets: ['Rapid growth of the cerebral cortex', 'Continued neuronal migration', 'Organization of neurons into different brain regions', 'Formation of early neural circuits', 'Beginning of synapse formation'],
  },
  {
    id: 'fingers',
    tone: 'orange',
    subtitle: 'Finger Development',
    paragraphs: [
      'At the same time, the surface ectoderm develops friction ridges on the fingertips. Fingerprint formation is influenced by genetics, volar pad shape, fetal growth, mechanical pressure inside the womb, amniotic fluid environment, and local developmental conditions.',
      'By approximately 17–19 weeks, the fingerprint ridge pattern becomes permanent. Except in cases of deep injury or scarring, fingerprints remain essentially unchanged throughout life.',
      'The simultaneous development of the brain and fingerprint ridges, along with their shared embryological origin from the ectoderm, forms the biological basis for scientific interest in dermatoglyphics.',
    ],
  },
  {
    id: 'dermatoglyphics',
    tone: 'blue',
    title: '13. Dermatoglyphics',
    paragraphs: [
      'The scientific study of fingerprint, palm, and sole ridge patterns is called Dermatoglyphics. The term was introduced by Dr. Harold Cummins, widely regarded as the Father of Dermatoglyphics.',
      'Today, dermatoglyphics has accepted scientific applications in forensic identification, anthropology, population genetics, medical research, and research on certain congenital and chromosomal disorders.',
      'Researchers have studied dermatoglyphic patterns in association with conditions such as Down Syndrome, Turner Syndrome, Klinefelter Syndrome, and certain congenital and neurodevelopmental disorders.',
      'In these settings, dermatoglyphics is used as a supportive research or screening tool, not as a standalone diagnostic test.',
    ],
  },
  {
    id: 'birth',
    tone: 'green',
    title: '14. Birth',
    paragraphs: [
      'At birth, a baby already possesses permanent fingerprints, most of the neurons they will ever have, and structurally developed brain regions.',
      'However, the brain is still functionally immature and continues developing for many years.',
    ],
  },
  {
    id: 'childhood',
    tone: 'purple',
    title: '15. Childhood Brain Development',
    paragraphs: [
      'After birth, the number of neurons changes relatively little in most brain regions. Instead, the brain develops through experience by creating trillions of neural connections.',
      'Every experience, movement, language interaction, and learning opportunity strengthens specific neural pathways.',
    ],
  },
  {
    id: 'pruning',
    tone: 'amber',
    title: '16. Synaptic Pruning',
    paragraphs: [
      'During childhood and adolescence, the brain removes weak or unused neural connections. This process is called Synaptic Pruning.',
      'Frequently used pathways become stronger, while unused pathways are eliminated, making the brain more efficient.',
    ],
  },
  {
    id: 'myelination',
    tone: 'orange',
    title: '17. Myelination',
    paragraphs: [
      'Another major developmental process is Myelination. Nerve fibers become coated with Myelin, a fatty insulating layer.',
      'Myelin dramatically increases the speed at which electrical signals travel between neurons. This process begins before birth and continues into the mid-20s, particularly in the prefrontal cortex.',
    ],
  },
  {
    id: 'adult',
    tone: 'blue',
    title: '18. Adult Brain',
    paragraphs: [
      'Throughout adulthood: neurons generally remain in their original brain regions; neural pathways continue changing through learning and experience; the brain remains adaptable because of neuroplasticity.',
      'The brain changes primarily by modifying connections, not by relocating neurons between different lobes.',
    ],
  },
  {
    id: 'conclusion',
    tone: 'green',
    title: 'Conclusion',
    paragraphs: [
      'The journey from conception to birth reveals an extraordinary process in which the human brain and fingerprint ridges develop side by side during early fetal life. Both structures originate from the ectoderm, the embryo\'s outer germ layer, before differentiating into two specialized tissues: the surface ectoderm, which forms the skin and fingerprint ridges, and the neuroectoderm, which gives rise to the brain, spinal cord, and the entire central nervous system.',
      'As the brain develops through neurulation, neurogenesis, neuronal migration, synaptogenesis, and cortical organization, the fingertips simultaneously develop their unique friction ridge patterns. Between approximately 13 and 19 weeks of gestation, these two developmental processes occur in parallel. By the end of this period, fingerprint patterns become permanent, while the brain\'s structural framework is largely established, laying the foundation for future learning, behavior, and cognitive development.',
      'After birth, fingerprints remain essentially unchanged throughout life, whereas the brain continues to mature through neuroplasticity, synaptic pruning, and myelination. Rather than neurons moving to different brain regions, lifelong development occurs through the strengthening, weakening, and reorganization of neural connections in response to experiences and learning.',
      'The field of dermatoglyphics studies the intricate ridge patterns found on the fingers, palms, and soles. Its established scientific applications include forensic identification, anthropology, population genetics, and research into certain congenital and chromosomal conditions. The shared embryological origin and overlapping developmental timeline of the brain and fingerprint ridges have also made dermatoglyphics an area of ongoing scientific interest in understanding aspects of human development.',
      'Overall, embryology demonstrates that the development of the brain and fingerprints is a highly coordinated biological process governed by genetics, fetal growth, and the prenatal environment. This remarkable developmental relationship provides the scientific foundation for the study of dermatoglyphics and continues to inspire research into how early human development shapes the unique characteristics of every individual.',
    ],
  },
];
