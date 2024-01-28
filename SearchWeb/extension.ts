import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand('extension.searchWeb', () => {
        const editor = vscode.window.activeTextEditor;

        if (editor) {
            handleTextEditor(editor);
        } else if (vscode.window.activeTerminal) {
            handleTerminal(vscode.window.activeTerminal);
        }else {
            vscode.window.showInformationMessage('No active text editor.');
        }
    });

    context.subscriptions.push(disposable);

    // Set context for 'searchWeb:enabled' to true
    vscode.commands.executeCommand('setContext', 'searchWeb:enabled', true);

    // Register a command to toggle the 'searchWeb:enabled' context
    vscode.commands.registerCommand('searchWeb.toggle', () => {
        vscode.commands.executeCommand('setContext', 'searchWeb:enabled', !vscode.workspace.getConfiguration('searchWeb').get<boolean>('enabled'));
    });

    // Listen for changes in the text editor's selection
    vscode.window.onDidChangeTextEditorSelection((event) => {
        // Check if the 'searchWeb:enabled' context is true in the configuration
        if (vscode.workspace.getConfiguration('searchWeb').get<boolean>('enabled')) {
            // Set the 'searchWeb:visible' context based on whether the selection is empty
            vscode.commands.executeCommand('setContext', 'searchWeb:visible', !!event.textEditor.selection.isEmpty);
        }
    });
}

async function handleTextEditor(editor: vscode.TextEditor) {
    const selection = editor.selection;
    const searchText = editor.document.getText(selection);

    if (searchText) {
        const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(searchText)}`;
        vscode.env.openExternal(vscode.Uri.parse(searchUrl));
    } else {
        vscode.window.showInformationMessage('No text selected.');
    }
}

async function handleTerminal(terminal: vscode.Terminal) {
    // Extract text from the terminal selection (if any)
    terminal.sendText('echo -n $TM_SELECTED_TEXT', true);
    
    // Use await to handle the promise and get the resolved value
    const clipboardContent = await vscode.commands.executeCommand<string>('editor.action.clipboardPasteAction');

    if (clipboardContent) {
        const searchText = clipboardContent.trim();
        if (searchText) {
            const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(searchText)}`;
            vscode.env.openExternal(vscode.Uri.parse(searchUrl));
        } else {
            vscode.window.showInformationMessage('No text selected in the terminal.');
        }
    } else {
        vscode.window.showInformationMessage('No text selected in the terminal.');
    }
}

