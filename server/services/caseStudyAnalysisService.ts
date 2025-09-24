import { aiResponseService } from './aiResponseService';

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

export class CaseStudyAnalysisService {
  private readonly analysisPrompt = `
You are a business case study analysis expert. Analyze the following case study content and provide a comprehensive analysis in JSON format.

Please provide:
1. A concise executive summary (2-3 paragraphs)
2. 5-7 key points that highlight the most important aspects
3. 5-6 thought-provoking discussion questions for group analysis
4. Slide content formatted for presentation including:
   - A compelling title
   - Brief overview
   - 4-5 key insights
   - 3-4 action items
   - 3-4 discussion starters
5. Strategic recommendations based on the case

Return your response as a valid JSON object with the following structure:
{
  "summary": "Executive summary text...",
  "keyPoints": ["Point 1", "Point 2", ...],
  "discussionQuestions": ["Question 1?", "Question 2?", ...],
  "slideContent": {
    "title": "Compelling presentation title",
    "overview": "Brief overview for slides",
    "keyInsights": ["Insight 1", "Insight 2", ...],
    "actionItems": ["Action 1", "Action 2", ...],
    "discussionStarters": ["Starter 1", "Starter 2", ...]
  },
  "recommendations": ["Recommendation 1", "Recommendation 2", ...]
}

Case Study Content:
`;

  async analyzeCaseStudy(
    content: string,
    fileName: string,
    provider: 'openai' | 'gemini' | 'anthropic' = 'openai'
  ): Promise<CaseStudyAnalysis> {
    try {
      console.log(`Starting case study analysis for ${fileName} using ${provider}`);
      
      const fullPrompt = this.analysisPrompt + content;
      
      // Call the AI response service to get analysis
      const response = await aiResponseService.generateResponse(
        provider,
        fullPrompt,
        {
          temperature: 0.3, // Lower temperature for more consistent analysis
          max_tokens: 2000,
          responseFormat: 'json'
        }
      );

      // Parse the JSON response
      let analysisResult: any;
      try {
        // Extract JSON from response if it's wrapped in markdown or other text
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        const jsonText = jsonMatch ? jsonMatch[0] : response;
        analysisResult = JSON.parse(jsonText);
      } catch (parseError) {
        console.error('Error parsing AI response as JSON:', parseError);
        console.log('Raw AI response:', response);
        
        // Fallback to structured text parsing
        analysisResult = this.parseUnstructuredResponse(response, fileName);
      }

      // Ensure all required fields are present with fallbacks
      const analysis: CaseStudyAnalysis = {
        summary: analysisResult.summary || `Analysis of ${fileName}: ${response.substring(0, 300)}...`,
        keyPoints: Array.isArray(analysisResult.keyPoints) ? analysisResult.keyPoints : [
          'Key business challenge identified',
          'Strategic implications analyzed', 
          'Stakeholder impacts considered',
          'Potential solutions explored',
          'Implementation considerations reviewed'
        ],
        discussionQuestions: Array.isArray(analysisResult.discussionQuestions) ? analysisResult.discussionQuestions : [
          'What are the primary challenges facing the organization?',
          'How should leadership prioritize competing interests?',
          'What implementation risks need to be addressed?',
          'How can success be measured?',
          'What would you do differently?'
        ],
        slideContent: {
          title: analysisResult.slideContent?.title || `Case Study: ${fileName.replace('.pdf', '')}`,
          overview: analysisResult.slideContent?.overview || 'Comprehensive analysis of business case study',
          keyInsights: Array.isArray(analysisResult.slideContent?.keyInsights) ? analysisResult.slideContent.keyInsights : [
            'Critical business challenges identified',
            'Strategic options evaluated',
            'Stakeholder impact assessment completed',
            'Implementation roadmap considerations'
          ],
          actionItems: Array.isArray(analysisResult.slideContent?.actionItems) ? analysisResult.slideContent.actionItems : [
            'Review strategic alternatives',
            'Assess implementation feasibility',
            'Develop stakeholder engagement plan'
          ],
          discussionStarters: Array.isArray(analysisResult.slideContent?.discussionStarters) ? analysisResult.slideContent.discussionStarters : [
            'What would you prioritize first?',
            'How would you handle resistance?',
            'What metrics would you track?'
          ]
        },
        recommendations: Array.isArray(analysisResult.recommendations) ? analysisResult.recommendations : [
          'Conduct thorough stakeholder analysis',
          'Develop phased implementation approach',
          'Establish clear success metrics',
          'Create contingency plans'
        ],
        generatedAt: new Date()
      };

      console.log(`Case study analysis completed for ${fileName}`);
      return analysis;
      
    } catch (error) {
      console.error('Error in case study analysis:', error);
      throw new Error(`Failed to analyze case study: ${error.message}`);
    }
  }

  private parseUnstructuredResponse(response: string, fileName: string): any {
    // Fallback parser for when AI doesn't return proper JSON
    return {
      summary: `Analysis of ${fileName}: ${response.substring(0, 300)}...`,
      keyPoints: response.split('\n').filter(line => 
        line.trim().startsWith('-') || line.trim().startsWith('*') || line.trim().match(/^\d+\./)
      ).slice(0, 5),
      discussionQuestions: [
        'What are the key challenges presented in this case?',
        'How would you approach solving the primary problem?',
        'What factors should influence the decision-making process?',
        'What are the potential risks and benefits?',
        'How would you measure success?'
      ],
      slideContent: {
        title: `Case Analysis: ${fileName.replace('.pdf', '')}`,
        overview: 'Detailed business case study analysis',
        keyInsights: ['Business challenge analysis', 'Strategic considerations', 'Implementation factors'],
        actionItems: ['Assess situation', 'Develop strategy', 'Plan implementation'],
        discussionStarters: ['What would you do?', 'What are the risks?', 'How to measure success?']
      },
      recommendations: ['Analyze thoroughly', 'Consider all stakeholders', 'Plan implementation carefully']
    };
  }

  async generateMultipleAnalyses(
    content: string,
    fileName: string,
    providers: ('openai' | 'gemini' | 'anthropic')[]
  ): Promise<{ provider: 'openai' | 'gemini' | 'anthropic'; analysis: CaseStudyAnalysis }[]> {
    const results: { provider: 'openai' | 'gemini' | 'anthropic'; analysis: CaseStudyAnalysis }[] = [];
    
    for (const provider of providers) {
      try {
        const analysis = await this.analyzeCaseStudy(content, fileName, provider);
        results.push({ provider, analysis });
      } catch (error) {
        console.error(`Error with ${provider} analysis:`, error);
        // Continue with other providers
      }
    }
    
    return results;
  }
}

export const caseStudyAnalysisService = new CaseStudyAnalysisService();