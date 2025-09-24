# **App Name**: ModelSherlock

## Core Features:

- Model Upload and Processing: Securely accept .pth or .zip model uploads, extract the model if zipped, validate the file format, and initiate the analysis pipeline.
- Vulnerability Report Generation: Aggregate the outputs from the static analyzer, baseliner, robustness tester, explainability tester, and trojan detector to calculate and assign a risk score (0-100). Export a JSON and PDF report.
- Interactive Report Viewer: Display the audit results interactively within a web dashboard, including graphs, tables, heatmaps, and JSON summaries of architecture.
- Suspicious Trigger Detection Tool: Employ a tool that attempts to reconstruct hidden backdoor triggers in models by optimizing small input patterns (stickers, patches) to maximize the activation of dormant or suspicious neurons. Then generate potential backdoor trigger examples with a misclassification report.
- AI Explainability Heatmaps: Display Grad-CAM / saliency mapping heatmaps to visualize the decision-making focus of the model. Checks if the model is attending to the correct features (dog → face/ears, not background).
- Performance Baseline Metrics: Calculate and display performance baseline accuracy and loss on clean datasets (CIFAR-10) to establish expected normal model behavior.

## Style Guidelines:

- Primary color: Strong Purple (#7952B3), conveying security with a touch of modernity.
- Background color: Very light desaturated purple (#F2F0F7), a subtle background that is easy on the eye.
- Accent color: Cyan (#50D9FF) for interactive elements, buttons, and progress indicators to add a bright and modern touch.
- Body and headline font: 'Inter' sans-serif font for its modern, machined, objective, neutral look.
- Code font: 'Source Code Pro' for displaying code snippets.
- Use minimalist, security-themed icons throughout the interface.
- Maintain a clean and structured layout, dividing sections logically for intuitive navigation.