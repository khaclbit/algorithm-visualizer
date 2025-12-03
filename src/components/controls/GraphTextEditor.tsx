import React, { useState, useCallback, useMemo } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, CheckCircle, Clock, FileText, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

import { graphTextParser } from '@/lib/textParser';
import { updateGraphModel } from '@/lib/graphModelTransformer';
import { useGraph } from '@/context/GraphContext';
import { ValidationError, ParseResult } from '@/types/graphText';

interface GraphTextEditorProps {
  className?: string;
  onContentChange?: (content: string) => void;
  placeholder?: string;
}

export const GraphTextEditor: React.FC<GraphTextEditorProps> = ({
  className,
  onContentChange,
  placeholder = "Enter graph in format:\nA B 5\nB C 3\nC A 2"
}) => {
  const { graph, setGraph } = useGraph();
  const [textContent, setTextContent] = useState('');
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [isDebouncing, setIsDebouncing] = useState(false);

  // Debounced parsing
  const debouncedParse = useCallback(
    useMemo(() => {
      let timeoutId: NodeJS.Timeout;
      return (text: string) => {
        setIsDebouncing(true);
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          const result = graphTextParser.parseText(text);
          setParseResult(result);
          setIsDebouncing(false);
        }, 300); // 300ms debounce
      };
    }, []),
    []
  );

  // Handle text content changes
  const handleTextChange = useCallback((value: string) => {
    setTextContent(value);
    onContentChange?.(value);
    
    if (value.trim() === '') {
      setParseResult(null);
      setIsDebouncing(false);
    } else {
      debouncedParse(value);
    }
  }, [onContentChange, debouncedParse]);

  // Apply parsed graph to context
  const applyToGraph = useCallback(() => {
    if (!parseResult?.success || !parseResult.graph) return;
    
    try {
      const newGraphModel = updateGraphModel(graph, parseResult.graph);
      setGraph(newGraphModel);
    } catch (error) {
      console.error('Failed to apply parsed graph:', error);
    }
  }, [parseResult, graph, setGraph]);

  // Clear the text editor
  const clearText = useCallback(() => {
    setTextContent('');
    setParseResult(null);
    onContentChange?.('');
  }, [onContentChange]);

  // Get validation status
  const validationStatus = useMemo(() => {
    if (!parseResult) return null;
    if (isDebouncing) return 'parsing';
    if (parseResult.success) return 'valid';
    return 'error';
  }, [parseResult, isDebouncing]);

  // Format parse metadata for display
  const formatParseMetadata = useCallback(() => {
    if (!parseResult?.metadata) return null;
    
    const { parseTime, vertexCount, edgeCount, errorCount } = parseResult.metadata;
    return {
      parseTime: Math.round(parseTime * 100) / 100,
      vertexCount,
      edgeCount,
      errorCount,
    };
  }, [parseResult?.metadata]);

  // Group errors by type for better display
  const groupedErrors = useMemo(() => {
    if (!parseResult?.errors) return {};
    
    const groups: Record<string, ValidationError[]> = {};
    parseResult.errors.forEach(error => {
      if (!groups[error.type]) groups[error.type] = [];
      groups[error.type].push(error);
    });
    
    return groups;
  }, [parseResult?.errors]);

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          <h3 className="font-semibold">Graph Text Editor</h3>
          {validationStatus && (
            <Badge variant={
              validationStatus === 'valid' ? 'default' :
              validationStatus === 'error' ? 'destructive' : 'secondary'
            }>
              {validationStatus === 'valid' && <CheckCircle className="h-3 w-3 mr-1" />}
              {validationStatus === 'error' && <AlertCircle className="h-3 w-3 mr-1" />}
              {validationStatus === 'parsing' && <Clock className="h-3 w-3 mr-1 animate-spin" />}
              {validationStatus === 'valid' ? 'Valid' : 
               validationStatus === 'error' ? 'Errors' : 'Parsing...'}
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {parseResult?.success && (
            <Button size="sm" onClick={applyToGraph}>
              Apply to Graph
            </Button>
          )}
          <Button size="sm" variant="outline" onClick={clearText}>
            <Trash2 className="h-3 w-3 mr-1" />
            Clear
          </Button>
        </div>
      </div>

      {/* Text Input */}
      <Textarea
        value={textContent}
        onChange={(e) => handleTextChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          'min-h-[200px] font-mono text-sm',
          validationStatus === 'error' && 'border-red-300 focus:border-red-500',
          validationStatus === 'valid' && 'border-green-300 focus:border-green-500'
        )}
      />

      {/* Results and Feedback */}
      {(parseResult || isDebouncing) && (
        <Tabs defaultValue="overview" className="w-full">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            {parseResult?.errors && parseResult.errors.length > 0 && (
              <TabsTrigger value="errors" className="text-red-600">
                Errors ({parseResult.errors.length})
              </TabsTrigger>
            )}
            <TabsTrigger value="help">Help</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Parse Results</CardTitle>
              </CardHeader>
              <CardContent>
                {isDebouncing ? (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4 animate-spin" />
                    <span>Parsing text...</span>
                  </div>
                ) : formatParseMetadata() ? (
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Nodes</div>
                      <div className="font-semibold">{formatParseMetadata()!.vertexCount}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Edges</div>
                      <div className="font-semibold">{formatParseMetadata()!.edgeCount}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Parse Time</div>
                      <div className="font-semibold">{formatParseMetadata()!.parseTime}ms</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Status</div>
                      <div className={cn(
                        'font-semibold',
                        parseResult?.success ? 'text-green-600' : 'text-red-600'
                      )}>
                        {parseResult?.success ? 'Valid' : `${formatParseMetadata()!.errorCount} errors`}
                      </div>
                    </div>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="errors" className="mt-4">
            <div className="space-y-3">
              {Object.entries(groupedErrors).map(([errorType, errors]) => (
                <Alert key={errorType} variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="font-semibold mb-2 capitalize">
                      {errorType.replace('_', ' ')} ({errors.length})
                    </div>
                    <div className="space-y-1 text-sm">
                      {errors.map((error, index) => (
                        <div key={index} className="pl-2">
                          <span className="text-muted-foreground">Line {error.lineNumber}:</span> {error.message}
                          {error.suggestion && (
                            <div className="text-xs text-muted-foreground mt-1 pl-4">
                              💡 {error.suggestion}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="help" className="mt-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Format Guide</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-3">
                <div>
                  <div className="font-semibold">Format:</div>
                  <div className="font-mono bg-muted p-2 rounded mt-1">
                    vertex1 vertex2 weight
                  </div>
                </div>
                
                <div>
                  <div className="font-semibold">Examples:</div>
                  <div className="font-mono bg-muted p-2 rounded mt-1 space-y-1">
                    <div>A B 5</div>
                    <div>1 2 3.5</div>
                    <div>node_1 node_2 10</div>
                  </div>
                </div>

                <div>
                  <div className="font-semibold">Rules:</div>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Vertex names: Letters, numbers, and underscores only</li>
                    <li>Weights must be positive numbers</li>
                    <li>One edge per line</li>
                    <li>Empty lines are ignored</li>
                    <li>Duplicate edges: last definition wins</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};