'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Mail, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { getCachedAccessToken } from '@/lib/supabase';

import emailjs from '@emailjs/browser';

interface ContactCandidateDialogProps {
    candidateId: string;
    candidateName: string;
    candidateEmail?: string;
}

export function ContactCandidateDialog({ candidateId, candidateName, candidateEmail }: ContactCandidateDialogProps) {
    const [open, setOpen] = useState(false);
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [errorMsg, setErrorMsg] = useState('');

    const handleOpenChange = (newOpen: boolean) => {
        setOpen(newOpen);
        if (!newOpen) {
            // Reset state when closing
            setTimeout(() => {
                setSubject('');
                setMessage('');
                setStatus('idle');
                setErrorMsg('');
            }, 300);
        }
    };

    const handleSend = async () => {
        if (!subject.trim() || !message.trim()) {
            setStatus('error');
            setErrorMsg('Please fill in both subject and message.');
            return;
        }

        if (!candidateEmail) {
            setStatus('error');
            setErrorMsg('Candidate email address is missing.');
            return;
        }

        try {
            setStatus('loading');
            setErrorMsg('');

            const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
            const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
            const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;

            if (!serviceId || !templateId || !publicKey) {
                throw new Error('EmailJS credentials are not configured in environment variables.');
            }

            // Initialize EmailJS with public key
            emailjs.init(publicKey);

            const templateParams = {
                to_name: candidateName,
                candidate_name: candidateName,
                to_email: candidateEmail,
                candidate_email: candidateEmail,
                recipient_email: candidateEmail,
                email: candidateEmail,
                user_email: candidateEmail,
                target_email: candidateEmail,
                dest_email: candidateEmail,
                message: message,
                recruiter_message: message,
                subject: subject
            };

            console.log('Sending EmailJS with service:', serviceId, 'template:', templateId);
            console.log('Final Payload:', JSON.stringify(templateParams, null, 2));

            const response = await emailjs.send(
                serviceId,
                templateId,
                templateParams,
                publicKey
            );

            console.log('EmailJS response:', response);
            setStatus('success');
        } catch (err: any) {
            const errDetail = {
                status: err?.status,
                text: err?.text,
                message: err?.message,
                original: JSON.stringify(err)
            };
            console.error('Detailed EmailJS error:', errDetail);
            setStatus('error');

            let displayMsg = 'Failed to send message via EmailJS.';
            if (errDetail.text) displayMsg = `EmailJS Error: ${errDetail.text}`;
            else if (errDetail.message) displayMsg = `Error: ${errDetail.message}`;
            else if (errDetail.status) displayMsg = `Error Status: ${errDetail.status}`;

            setErrorMsg(displayMsg);
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Contact Candidate
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Message {candidateName}</DialogTitle>
                    <DialogDescription>
                        Send an email directly to this candidate. They will receive the message in their inbox.
                    </DialogDescription>
                </DialogHeader>

                {status === 'success' ? (
                    <div className="flex flex-col items-center justify-center py-8 space-y-4">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                            <CheckCircle2 className="w-6 h-6 text-green-600" />
                        </div>
                        <p className="text-center font-medium">Message sent successfully to the candidate.</p>
                        <Button onClick={() => setOpen(false)} className="mt-4">
                            Close
                        </Button>
                    </div>
                ) : (
                    <div className="grid gap-4 py-4">
                        {status === 'error' && (
                            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                <span>{errorMsg}</span>
                            </div>
                        )}

                        <div className="grid gap-2">
                            <Label htmlFor="subject">Subject</Label>
                            <Input
                                id="subject"
                                placeholder="Interview Invitation, Follow-up, etc."
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                disabled={status === 'loading'}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="message">Message</Label>
                            <Textarea
                                id="message"
                                placeholder="Hi there, I saw your profile and..."
                                className="min-h-[150px] resize-none"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                disabled={status === 'loading'}
                            />
                        </div>
                    </div>
                )}

                {status !== 'success' && (
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setOpen(false)} disabled={status === 'loading'}>
                            Cancel
                        </Button>
                        <Button onClick={handleSend} disabled={status === 'loading'}>
                            {status === 'loading' ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Sending...
                                </>
                            ) : (
                                'Send Message'
                            )}
                        </Button>
                    </DialogFooter>
                )}
            </DialogContent>
        </Dialog>
    );
}
