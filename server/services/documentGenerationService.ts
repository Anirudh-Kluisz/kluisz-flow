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
    const docFileName = `${originalFileName.replace('.pdf', '')}_analysis_${provider}_${timestamp}.doc`;
    const docPath = join(this.outputDir, docFileName);

    // Generate document content in RTF format (compatible with Word)
    const docContent = this.formatCaseStudyDocumentAsRTF(analysis, originalFileName, provider);
    
    // Save as .doc file in RTF format
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

  private formatCaseStudyDocumentAsRTF(
    analysis: CaseStudyAnalysis,
    originalFileName: string,
    provider: string
  ): string {
    // RTF format that can be opened by Word and other document processors
    const rtfContent = `{\\rtf1\\ansi\\deff0 {\\fonttbl {\\f0 Times New Roman;}{\\f1 Arial;}}
{\\colortbl;\\red0\\green0\\blue0;\\red0\\green0\\blue255;}
\\f1\\fs24

{\\b\\fs32 CASE STUDY ANALYSIS REPORT}\\par
\\par
{\\b Document:} ${originalFileName}\\par
{\\b Analyzed by:} ${provider.toUpperCase()} AI\\par
{\\b Generated:} ${analysis.generatedAt.toLocaleString()}\\par
\\par

{\\b\\fs28 EXECUTIVE SUMMARY}\\par
\\par
${analysis.summary.replace(/\n/g, '\\par\n')}\\par
\\par

{\\b\\fs28 KEY POINTS}\\par
\\par
${analysis.keyPoints.map((point, index) => `${index + 1}. ${point}`).join('\\par\n')}\\par
\\par

{\\b\\fs28 SLIDE CONTENT FOR PRESENTATION}\\par
\\par
{\\b Title:} ${analysis.slideContent.title}\\par
\\par
{\\b Overview:}\\par
${analysis.slideContent.overview.replace(/\n/g, '\\par\n')}\\par
\\par
{\\b Key Insights:}\\par
${analysis.slideContent.keyInsights.map((insight) => `• ${insight}`).join('\\par\n')}\\par
\\par
{\\b Action Items:}\\par
${analysis.slideContent.actionItems.map((item) => `• ${item}`).join('\\par\n')}\\par
\\par
{\\b Discussion Starters:}\\par
${analysis.slideContent.discussionStarters.map((starter) => `• ${starter}`).join('\\par\n')}\\par
\\par

{\\b\\fs28 DISCUSSION QUESTIONS}\\par
\\par
${analysis.discussionQuestions.map((question, index) => `${index + 1}. ${question}`).join('\\par\n')}\\par
\\par

{\\b\\fs28 STRATEGIC RECOMMENDATIONS}\\par
\\par
${analysis.recommendations.map((rec, index) => `${index + 1}. ${rec}`).join('\\par\n')}\\par
\\par

\\par
{\\i This analysis was generated automatically using AI technology.}\\par
{\\i Please review and validate all recommendations before making business decisions.}\\par
}`;

    return rtfContent;
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