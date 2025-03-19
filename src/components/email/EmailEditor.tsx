import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Bold,
  Italic,
  Underline,
  Link,
  Image,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from "lucide-react";

interface EmailEditorProps {
  onSend: (emailData: EmailData) => void;
  onCancel: () => void;
  initialSubject?: string;
  initialContent?: string;
  initialTo?: string;
  showToField?: boolean;
}

export interface EmailData {
  to: string;
  subject: string;
  content: string;
  isHtml: boolean;
}

export default function EmailEditor({
  onSend,
  onCancel,
  initialSubject = "",
  initialContent = "",
  initialTo = "",
  showToField = true,
}: EmailEditorProps) {
  const [subject, setSubject] = useState(initialSubject);
  const [content, setContent] = useState(initialContent);
  const [to, setTo] = useState(initialTo);
  const [activeTab, setActiveTab] = useState<"wysiwyg" | "html">("wysiwyg");
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    if (!subject || !content || (showToField && !to)) {
      return;
    }

    setIsSending(true);
    try {
      await onSend({
        to,
        subject,
        content,
        isHtml: activeTab === "html",
      });
    } finally {
      setIsSending(false);
    }
  };

  const insertFormatting = (tag: string) => {
    if (activeTab === "html") {
      setContent((prev) => `${prev}<${tag}></${tag}>`);
    } else {
      // For WYSIWYG, we would implement actual formatting
      // This is a simplified version
      const formattingMap: Record<string, string> = {
        b: "**",
        i: "*",
        u: "__",
        a: "[link](url)",
        img: "![image](url)",
        ul: "\n- Item\n- Item\n",
        ol: "\n1. Item\n2. Item\n",
      };

      if (formattingMap[tag]) {
        setContent((prev) => `${prev}${formattingMap[tag]}`);
      }
    }
  };

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="space-y-4">
          {showToField && (
            <div className="space-y-2">
              <Label htmlFor="to">Para</Label>
              <Input
                id="to"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                placeholder="email@ejemplo.com"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="subject">Asunto</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Asunto del email"
            />
          </div>

          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as "wysiwyg" | "html")}
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="wysiwyg">Editor</TabsTrigger>
              <TabsTrigger value="html">HTML</TabsTrigger>
            </TabsList>

            <div className="border-b border-gray-200 my-2 py-2">
              <div className="flex flex-wrap gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  type="button"
                  onClick={() => insertFormatting("b")}
                >
                  <Bold className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  type="button"
                  onClick={() => insertFormatting("i")}
                >
                  <Italic className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  type="button"
                  onClick={() => insertFormatting("u")}
                >
                  <Underline className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  type="button"
                  onClick={() => insertFormatting("a")}
                >
                  <Link className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  type="button"
                  onClick={() => insertFormatting("img")}
                >
                  <Image className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  type="button"
                  onClick={() => insertFormatting("ul")}
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  type="button"
                  onClick={() => insertFormatting("ol")}
                >
                  <ListOrdered className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  type="button"
                  onClick={() => {}}
                >
                  <AlignLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  type="button"
                  onClick={() => {}}
                >
                  <AlignCenter className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  type="button"
                  onClick={() => {}}
                >
                  <AlignRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <TabsContent value="wysiwyg" className="mt-2">
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Escribe el contenido del email aquí..."
                className="min-h-[300px]"
              />
            </TabsContent>

            <TabsContent value="html" className="mt-2">
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="<p>Escribe tu HTML aquí...</p>"
                className="min-h-[300px] font-mono"
              />
            </TabsContent>
          </Tabs>

          <div className="flex justify-end space-x-2 mt-4">
            <Button variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button onClick={handleSend} disabled={isSending}>
              {isSending ? "Enviando..." : "Enviar Email"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
