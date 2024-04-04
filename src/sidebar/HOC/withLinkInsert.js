import React from 'react';
import { select, dispatch } from '@wordpress/data';
import { showNotice } from "../Notices";

const BlockAttributes = {
    'core/paragraph': ['content'],
    'core/pullquote': ['citation', 'value'],
    'core/heading': ['content'],
    'core/list-item': ['content'],
    'core/image': ['caption'],
    'core/quote': ['value', 'citation'],
    'core/gallery': ['caption'], // problem
    'core/audio': ['caption'],
    'core/preformatted': ['content'],
    'core/table': [], // problem
    'core/verse': ['content']
}

const LinkWithInsertAction = OriginalComponent => {
    class NewComponent extends React.Component {
        constructor(props) {
            super(props);

            this.handleClick = this.handleClick.bind(this);
            this.getSelection = this.getSelection.bind(this);
            this.insertLink = this.insertLink.bind(this);
            this.copyLink = this.copyLink.bind(this);
            // this.hideError = this.hideError.bind(this)
        }

        handleClick(e) {
            e.preventDefault();

            if (e.target.classList.contains("insert-allowed")) { // Этот класс проверяет что ткнули куда нужно
                if (this.props.inArticle && cherrylink_options['multilink'] !== 'checked') { // Уже есть в тексте, проверяем мультивставку
                    showNotice('Ссылка уже присутствует в тексте');
                } else { // Просто вставляем ссылку
                    const currentSelection = this.getSelection(e);
                    // update block
                    if (currentSelection) {
                        let template = this.chooseTemplate(event);
                        this.insertLink(template, currentSelection)
                    }
                }
            }
        }

        getSelection(event) {
            const selectionStart = select('core/block-editor').getSelectionStart();
            const selectionEnd = select('core/block-editor').getSelectionEnd();


            const blockId = selectionStart.clientId;

            if (blockId === undefined)
                return false;

            let attributeKey = selectionStart.attributeKey;

            const block = select('core/block-editor').getBlock(blockId);

            if (attributeKey === undefined || !BlockAttributes.hasOwnProperty(block.name)) {
                showNotice('Данный тип блоков пока не поддерживается. Вы можете воспользоваться кнопкой "Скопировать ссылку" в панели перелинковки.');
                console.log(`Block "${block.name}" isn't supported yet`);
                console.log(block);
                return false;
            }

            const startOffset = selectionStart.offset;
            const endOffset = selectionEnd.offset;

            // text ne videlen
            if (startOffset === endOffset && !(event.ctrlKey || event.metaKey) ) {
                // this.setState()
                // this.context({showError: true, message: "Текст не выделен"})
                showNotice("Выделите текст или используйте CTRL/CMD+Click для альтернативного шаблона");
                return false;
            }
        

            if (typeof attributeKey === 'string' || attributeKey instanceof String) {
                // tyt vse ez
    
                console.log(`AttributeKey is standart: ${attributeKey}`);
            } else {
                const probableAttributes = BlockAttributes[block.name];
    
                // if attributeKey === number
                const selection = window.getSelection();
                const ankorParentInnerText = selection.anchorNode.parentNode.innerText.replace(/\n/g, ' ').trim();
                const ankorText = selection.toString();

                probableAttributes.forEach(attr => {
                    const richElement = wp.richText.create({html:block.attributes[attr]})
                    const simpleText = wp.richText.getTextContent(richElement).replace(/\n/g, ' ').trim();

                    if (simpleText.toLowerCase() === ankorParentInnerText.toLowerCase() && simpleText.substring(startOffset, endOffset).toLowerCase() === ankorText.toLowerCase()) {
                        attributeKey = attr;
                        console.log(`AttributeKey found: ${attr}`);
                    }
                });

                if (typeof attributeKey !== 'string' && !(attributeKey instanceof String)) {
                    console.log(`Cannot find attributeKey...`);
                    showNotice('Данный тип блоков пока не поддерживается. Вы можете воспользоваться кнопкой "Скопировать ссылку" в панели перелинковки.')
                    return false;
                }

            }

            const blockContent = block.attributes[attributeKey];

            const returnObject = {
                block: block,
                blockId: blockId,
                attributeKey: attributeKey,
                startOffset: startOffset,
                endOffset: endOffset,
                blockContent: blockContent
            }

            console.log(returnObject);

            return returnObject;
        }

        insertLink(linkTemplate, curSel) {
            let postId = "";
            let url = "";
            let title = "";
            let titleseo = "";
            let category = "";
            let date = "";
            let author = "";
            let anons = "";
            let imagesrc = "";

            if (OriginalComponent.fullName === "LinkItem" || OriginalComponent.fullName === "SuggestionInsert") {
                const {linkObj} = this.props;
                postId =  linkObj["data-postid"];
                url = linkObj["data-url"];
                title = linkObj["data-title"];
                titleseo = linkObj["data-titleseo"]
                category = linkObj["data-category"]
                date = linkObj["data-date"]
                author = linkObj["data-author"]
                anons = linkObj["data-anons"]
                imagesrc = linkObj["data-imagesrc"]
            } else {
                const {termName, termUrl} = this.props;
                url = termUrl;
                title = termName;
            }

            // dolboebizm, no legche metoda net
            let blockContent = '';
            // for lists and poems we have to add newline char to fix offsets
            if (curSel.block.name === "core/list") {
                blockContent = curSel.blockContent.replace(/<\/li>/g,"</li>↵"); //↵¤
            } else if (curSel.block.name === "core/verse") {
                blockContent = curSel.blockContent.replace(/(<br>|<BR>)/g,"<br>↵"); //↵¤
            } else {
                blockContent = curSel.blockContent;
            }

            // remove html entities like &nbsp;
            blockContent = this.decodeHtml(blockContent);

            const richElement = wp.richText.create({html:blockContent})
            const simpleText = wp.richText.getTextContent(richElement);

            const [htmlStart, htmlEnd] = this.getHtmlPositions(simpleText, blockContent, curSel.startOffset, curSel.endOffset);

            let selectedAnkor = blockContent.substring(htmlStart, htmlEnd);
            
            // Move last space outside
            let addSpaceAfter = '';
            if (selectedAnkor.charAt(selectedAnkor.length - 1) === ' ') {
                addSpaceAfter = ' ';
            }
            // Create new content attribute
            let newContent = blockContent.substring(0, htmlStart) 
                + linkTemplate.replace("{url}", url)
                    .replace("{title}", title)
                    .replace("{titleseo}", titleseo)
                    .replace("{category}", category)
                    .replace("{date}", date)
                    .replace("{author}", author)
                    .replace("{imagesrc}", imagesrc)
                    .replace("{anons}", anons)
                    .replace("{selectedAnkor}", selectedAnkor.trim()) 
                + addSpaceAfter
                + blockContent.substring(htmlStart + selectedAnkor.length, curSel.length);

            // removing temporary spec char for lists
            newContent = newContent.replace(/↵/g, '');
            console.log(newContent);

            // replace original block with updated attributes
            const originalAttributes = curSel.block.attributes;
            originalAttributes[curSel.attributeKey] = newContent;
            curSel.block.attributes = originalAttributes;
            dispatch('core/block-editor').updateBlock(curSel.blockId, curSel.block);
            showNotice('Ссылка вставлена');

            // close suggestions panel
            if (OriginalComponent.fullName === "SuggestionInsert") {
                document.querySelector("#cherry_suggestions_close").click();
            }
        }

        chooseTemplate(event) {
            if (!cherrylink_options) {
                return `<a href="{url}" title="{title}">{selectedAnkor}</a>`;
            }
            let alt = false;
            let type = 'link';
            if (event.ctrlKey || event.metaKey) {
                alt = true;
            }
            if (OriginalComponent.fullName === 'TermItem')
                type = 'term';
            
            let template = alt ? cherrylink_options.templates[type].alt : 
                cherrylink_options.templates[type].before + "{selectedAnkor}" + cherrylink_options.templates[type].after;

            return this.urldecode(template);
        }

        urldecode(url) {
            return decodeURIComponent(url.replace(/\+/g, ' ')).replace(/\\\"/g, '\"');
        }

        decodeHtml(html) {
            var txt = document.createElement("textarea");
            txt.innerHTML = html;
            return txt.value;
        }

        // Get real ankor positions ommiting html tags
        getHtmlPositions(text, html, textStart, textEnd) {
            let htmlStart, htmlEnd, textIndex = 0, insideTag = false;
            for (let i = 0; i < html.length; i++) {

                if (textIndex === textStart) {
                    htmlStart = i;
                }

                if (textIndex === textEnd) {
                    htmlEnd = i;
                    break;
                }

                if (html[i] === '<' && text[textIndex] !== html[i] ) {
                    insideTag = true;
                }

                if (!insideTag) {
                    textIndex++;
                }

                if (html[i] === '>') {
                    insideTag = false;
                }
            }

            return [htmlStart, htmlEnd];

        }

        fcl_convertRelativeUrl(url) {
            if (url.indexOf("http") !== -1)
                return url;
    
            let host = location.host;
            let proto = location.protocol;
    
            if (url.length > 0) {
                if (url.indexOf(host) === -1) {
                    url = "//" + host + url;
                }
                if (url.indexOf(proto) === -1) {
                    url = proto + url;
                }
            }
    
            return url;
        }

        copyLink(url) {
            let preparedUrl = this.fcl_convertRelativeUrl(url);
            if (window.clipboardData && window.clipboardData.setData) {
                // Internet Explorer-specific code path to prevent textarea being shown while dialog is visible.
                return clipboardData.setData("Text", preparedUrl);
        
            }
            else if (document.queryCommandSupported && document.queryCommandSupported("copy")) {
                var textarea = document.createElement("textarea");
                textarea.textContent = preparedUrl;
                textarea.style.position = "fixed";  // Prevent scrolling to bottom of page in Microsoft Edge.
                document.body.appendChild(textarea);
                textarea.select();
                try {
                    showNotice("Ссылка скопирована в буфер обмена")
                    return document.execCommand("copy");  // Security exception may be thrown by some browsers.
                }
                catch (ex) {
                    console.warn("Copy to clipboard failed.", ex);
                    return false;
                }
                finally {
                    document.body.removeChild(textarea);
                }
            }
        }

        changeBlockLinks(postId, title, postMeta, updateCallback) {
            const {blockLinks, manualEdit, showAfter} = postMeta;
            let wasInBlock = false;
            let index = 0;
            blockLinks.forEach((element, i) => {
                if (element.post_id === postId) {
                    wasInBlock = true;
                    index = i;
                }
            });
    
            if (!wasInBlock) {
                blockLinks.push({ post_id: postId, keyword: title, m_keyword: "", use_manual: "false" });
                showNotice('Ссылка добавлена в блок')
            } else {
                blockLinks.splice(index, 1);
                showNotice('Ссылка удалена из блока')
            }
    
            updateCallback({
                blockLinks: blockLinks,
                manualEdit: manualEdit,
                showAfter: showAfter
            });
    
    
        }

        // hideError () {
        //     this.setState({showError: false, message: ""})
        // }

        // componentDidMount() {
        //     let context = this.context;
        //     console.log(context)
        // }

        render() {
            let passedProps = Object.assign({}, this.props);
            passedProps.clickHandler = this.handleClick;
            passedProps.copyLink = this.copyLink;
            passedProps.changeBlockLinks = this.changeBlockLinks;
            return (
                <>
                    <OriginalComponent { ...passedProps }/>
                </>
            )
        }

        
    }
    // OriginalComponent.contextType = NoticeContext;
    // NewComponent.contextType = NoticeContext;
    return NewComponent
}

export default LinkWithInsertAction;



