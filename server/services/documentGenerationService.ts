import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

interface CaseStudyAnalysis {
  summary: string;
  keyPoints: string[];
  discussionQuestions: string[];
  slideContent: {
    title: string;
    overview: string;
    keyInsights: string[];
    actionItems: string[];
    discussionStarters: string[];
  };
  recommendations: string[];
  generatedAt: Date;
}

export class DocumentGenerationService {
  private outputDir: string;

  constructor() {
    this.outputDir = join(process.cwd(), 'outputs');
    this.ensureOutputDirectory();
  }

  private ensureOutputDirectory() {
    if (!existsSync(this.outputDir)) {
      mkdirSync(this.outputDir, { recursive: true });
    }
  }

  async generateCaseStudyDocument(
    analysis: CaseStudyAnalysis,
    originalFileName: string,
    provider: string
  ): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const docFileName = `${originalFileName.replace('.pdf', '')}_analysis_${provider}_${timestamp}.txt`;
    const docPath = join(this.outputDir, docFileName);

    // Generate document content in a readable format
    const docContent = this.formatCaseStudyDocument(analysis, originalFileName, provider);
    
    // For now, save as .txt file (can be enhanced to .doc format with proper packages)
    writeFileSync(docPath, docContent, 'utf8');
    
    console.log(`Case study document generated: ${docPath}`);
    return docPath;
  }

  private formatCaseStudyDocument(
    analysis: CaseStudyAnalysis,
    originalFileName: string,
    provider: string
  ): string {
    const content = `
CASE STUDY ANALYSIS REPORT
==========================

Document: ${originalFileName}
Analyzed by: ${provider.toUpperCase()} AI
Generated: ${analysis.generatedAt.toLocaleString()}

EXECUTIVE SUMMARY
=================
${analysis.summary}

KEY POINTS
==========
${analysis.keyPoints.map((point, index) => `${index + 1}. ${point}`).join('\n')}

SLIDE CONTENT FOR PRESENTATION
===============================

Title: ${analysis.slideContent.title}

Overview:
${analysis.slideContent.overview}

Key Insights:
${analysis.slideContent.keyInsights.map((insight, index) => `• ${insight}`).join('\n')}

Action Items:
${analysis.slideContent.actionItems.map((item, index) => `• ${item}`).join('\n')}

Discussion Starters:
${analysis.slideContent.discussionStarters.map((starter, index) => `• ${starter}`).join('\n')}

DISCUSSION QUESTIONS
====================
${analysis.discussionQuestions.map((question, index) => `${index + 1}. ${question}`).join('\n')}

STRATEGIC RECOMMENDATIONS
=========================
${analysis.recommendations.map((rec, index) => `${index + 1}. ${rec}`).join('\n')}

---
This analysis was generated automatically using AI technology.
Please review and validate all recommendations before making business decisions.
`;

    return content.trim();
  }

  // Enhanced method for when officegen package is available
  async generateWordDocument(
    analysis: CaseStudyAnalysis,
    originalFileName: string,
    provider: string
  ): Promise<string> {
    // This will be implemented when officegen package is available
    // For now, fallback to text document
    console.log('Word document generation not yet available, creating text document');
    return await this.generateCaseStudyDocument(analysis, originalFileName, provider);
  }

  async generateSlideContent(analysis: CaseStudyAnalysis): Promise<string> {
    const slideContent = `
CASE STUDY DISCUSSION SLIDES
============================

SLIDE 1: ${analysis.slideContent.title}
${analysis.slideContent.overview}

SLIDE 2: KEY INSIGHTS
${analysis.slideContent.keyInsights.map((insight, index) => `${index + 1}. ${insight}`).join('\n')}

SLIDE 3: ACTION ITEMS
${analysis.slideContent.actionItems.map((item, index) => `${index + 1}. ${item}`).join('\n')}

SLIDE 4: DISCUSSION STARTERS
${analysis.slideContent.discussionStarters.map((starter, index) => `${index + 1}. ${starter}`).join('\n')}

SLIDE 5: NEXT STEPS
• Review key insights with stakeholders
• Prioritize action items
• Schedule follow-up discussions
• Implement recommendations
`;

    return slideContent.trim();
  }

  getOutputDirectory(): string {
    return this.outputDir;
  }

  // Utility method to list generated documents
  async listGeneratedDocuments(): Promise<{ name: string; path: string; createdAt: Date }[]> {
    try {
      const fs = await import('fs');
      const files = fs.readdirSync(this.outputDir);
      
      return files
        .filter(file => file.endsWith('.txt') || file.endsWith('.doc') || file.endsWith('.docx'))
        .map(file => {
          const filePath = join(this.outputDir, file);
          const stats = fs.statSync(filePath);
          return {
            name: file,
            path: filePath,
            createdAt: stats.birthtime
          };
        })
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } catch (error) {
      console.error('Error listing generated documents:', error);
      return [];
    }
  }
}

export const documentGenerationService = new DocumentGenerationService();