import { Injectable } from '@nestjs/common';
import Anthropic from '@anthropic-ai/sdk';

@Injectable()
export class AiService {
  private client: Anthropic;

  constructor() {
    this.client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }

  async generateQuotation(context: {
    enquiry: any;
    customer: any;
    similarOrders: any[];
    currentMaterialRates?: any[];
  }): Promise<string> {
    const prompt = `You are an expert quotation engineer for an Indian Special Purpose Machine (SPM) and Capital Goods manufacturing company.

Based on the following customer enquiry, generate a detailed, professional quotation.

CUSTOMER: ${context.customer.name} (GSTIN: ${context.customer.gstin || 'N/A'})
PAYMENT TERMS: ${context.customer.paymentTerms}

ENQUIRY DETAILS:
Subject: ${context.enquiry.subject}
Description: ${context.enquiry.description || 'Not specified'}
Specifications: ${JSON.stringify(context.enquiry.specifications || {}, null, 2)}
Required Delivery: ${context.enquiry.deliveryRequired ? new Date(context.enquiry.deliveryRequired).toLocaleDateString('en-IN') : 'To be discussed'}

${context.similarOrders.length > 0 ? `SIMILAR PAST ORDERS (for reference):
${context.similarOrders.map((o: any) => `- Order ${o.orderNo}: ${o.subject}, Value: ₹${o.totalAmount}, Delivered: ${o.deliveryDate ? new Date(o.deliveryDate).toLocaleDateString('en-IN') : 'N/A'}`).join('\n')}` : ''}

Generate a quotation with:
1. Line items with part descriptions, quantities, unit rates, and amounts in INR
2. GST breakdown (CGST 9% + SGST 9% for same-state OR IGST 18% for interstate)
3. Delivery timeline in weeks
4. Payment milestone schedule (typical for SPM: 30% advance, 30% against design approval, 30% against FAT, 10% on installation)
5. Key commercial terms

Return the response in this JSON format:
{
  "lineItems": [
    { "description": "", "qty": 1, "uom": "Nos", "unitRate": 0, "amount": 0, "hsnCode": "" }
  ],
  "subtotal": 0,
  "gstType": "IGST or CGST_SGST",
  "gstRate": 18,
  "taxAmount": 0,
  "totalAmount": 0,
  "deliveryWeeks": 12,
  "paymentMilestones": [
    { "name": "", "percentage": 30, "trigger": "" }
  ],
  "notes": "",
  "termsConditions": "",
  "aiSummary": "Brief explanation of quotation basis"
}`;

    const message = await this.client.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 2048,
      messages: [{ role: 'user', content: prompt }],
    });

    const content = message.content[0];
    if (content.type !== 'text') return '{}';

    // Extract JSON from response
    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    return jsonMatch ? jsonMatch[0] : content.text;
  }

  async answerQuery(context: {
    companyId: string;
    question: string;
    data: any;
    conversationHistory?: Array<{ role: string; content: string }>;
  }): Promise<string> {
    const systemPrompt = `You are ManuFlow AI, an intelligent ERP assistant for an Indian manufacturing company. 
You have access to real-time company data and can answer questions about orders, production, inventory, finance, and quality.
Always respond in a helpful, concise manner. Use Indian number formatting (₹ for amounts, lakh/crore for large numbers).
Current date: ${new Date().toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })}

Company Data Summary:
${JSON.stringify(context.data, null, 2)}`;

    const messages: Anthropic.MessageParam[] = [
      ...(context.conversationHistory || []).map((h) => ({
        role: h.role as 'user' | 'assistant',
        content: h.content,
      })),
      { role: 'user', content: context.question },
    ];

    const response = await this.client.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 1024,
      system: systemPrompt,
      messages,
    });

    const content = response.content[0];
    return content.type === 'text' ? content.text : 'Unable to process your query.';
  }

  async analyzePredictiveRisk(context: {
    workOrders: any[];
    question: string;
  }): Promise<string> {
    const prompt = `Analyze the following open work orders and identify delivery risks.

Work Orders:
${JSON.stringify(context.workOrders, null, 2)}

${context.question}

Provide a concise risk analysis with:
1. Orders at high risk (>70% delay probability)
2. Key bottlenecks
3. Recommended actions`;

    const response = await this.client.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    });

    const content = response.content[0];
    return content.type === 'text' ? content.text : 'Analysis unavailable.';
  }

  async generateJson(prompt: string): Promise<string> {
    const response = await this.client.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 2048,
      messages: [{ role: 'user', content: prompt }],
    });

    const content = response.content[0];
    if (content.type !== 'text') return '[]';
    const jsonMatch = content.text.match(/\[[\s\S]*\]|\{[\s\S]*\}/);
    return jsonMatch ? jsonMatch[0] : content.text;
  }

  async summarizeEnquiry(context: { enquiry: any }): Promise<string> {
    const prompt = `Summarize the following customer enquiry for a manufacturing company. 
Highlight the key technical requirements, delivery constraints, and any critical details.
Keep it professional and concise.

ENQUIRY NO: ${context.enquiry.enquiryNo}
SUBJECT: ${context.enquiry.subject}
DESCRIPTION: ${context.enquiry.description || 'N/A'}
SPECIFICATIONS: ${JSON.stringify(context.enquiry.specifications || {}, null, 2)}

Return a 2-3 sentence executive summary.`;

    const response = await this.client.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 512,
      messages: [{ role: 'user', content: prompt }],
    });

    const content = response.content[0];
    return content.type === 'text' ? content.text : 'Summary unavailable.';
  }
}

