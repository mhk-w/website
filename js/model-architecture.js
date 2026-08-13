// ============================================================================
// research-modeling.html: an interactive walkthrough of MSMLA-Net, the
// multi-scale, multi-level attention network from Kim, Jeong, & Kim (2021),
// ISPRS J. Photogrammetry and Remote Sensing. Clicking a stage reveals what
// that part of the architecture does, mirroring the thinking-card pattern
// on the Teaching page.
// ============================================================================

const ARCH_STAGES = {
  input: {
    title: 'Input Patch',
    text: 'A small image patch sampled around a point of interest, stacking Sentinel-2 spectral bands with ancillary GIS layers (elevation, building footprints, land cover) so the model sees both spectral and structural context at once.',
  },
  ms: {
    title: 'MS Module: Multi-Scale Feature Extraction',
    text: 'Three parallel convolutions at different kernel sizes extract features at multiple spatial scales from the same patch, then concatenate them into a single multi-scale feature map, so both fine detail and broader neighborhood context feed into the network together.',
  },
  resnet: {
    title: 'Modified SE-ResNet Backbone',
    text: 'The multi-scale features pass through three sequential SE-ResBlocks (16, 32, and 64 filters), a ResNet backbone modified with squeeze-and-excitation so the network learns to reweight feature channels by importance rather than treating them all equally.',
  },
  mla: {
    title: 'MLA Module: Multi-Level Attention',
    text: 'After the multi-scale stage and each SE-ResBlock, a CBAM (Convolutional Block Attention Module) branch applies channel and spatial attention and pools it into its own feature vector, so the network learns what to attend to at multiple depths, not just the final layer.',
  },
  fusion: {
    title: 'Feature Fusion',
    text: "All four attention-pooled feature vectors are concatenated with the backbone's own pooled output into a single 240-dimensional multi-level attention feature vector, combining what the network learned at every depth.",
  },
  output: {
    title: 'Classifier: FC + Softmax',
    text: 'A fully-connected layer and softmax classify the patch into one of 17 Local Climate Zones, the standardized scheme used to characterize urban form and landscape heterogeneity.',
  },
};

function initArchDiagram() {
  const stages = document.querySelectorAll('.arch-stage');
  const demo = document.getElementById('archDemo');
  const demoTitle = document.getElementById('archDemoTitle');
  const demoText = document.getElementById('archDemoText');
  if (!stages.length || !demo) return;

  stages.forEach((stage) => {
    stage.setAttribute('tabindex', '0');
    stage.setAttribute('role', 'button');

    const activate = () => {
      const wasActive = stage.classList.contains('active');
      stages.forEach((s) => s.classList.remove('active'));
      if (wasActive) {
        demo.hidden = true;
        return;
      }
      stage.classList.add('active');
      const info = ARCH_STAGES[stage.dataset.stage];
      if (!info) return;
      demoTitle.textContent = info.title;
      demoText.textContent = info.text;
      demo.hidden = false;
    };

    stage.addEventListener('click', activate);
    stage.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        activate();
      }
    });
  });
}

document.addEventListener('DOMContentLoaded', initArchDiagram);
