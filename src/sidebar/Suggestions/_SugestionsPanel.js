import React from 'react';
import { SuggestionList } from './SuggestionList';

const BlockAttributes = {
    'core/paragraph': ['content'],
    'core/pullquote': ['citation', 'value'],
    // 'core/heading': ['content'],
    'core/list': ['values'],
    'core/image': ['caption'],
    'core/quote': ['value', 'citation'],
    // 'core/gallery': ['caption'], // problem
    'core/audio': ['caption'],
    'core/preformatted': ['content'],
    // 'core/table': [], // problem
    'core/verse': ['content']
}

export class SuggestionsPanel extends React.Component {
    constructor(props) {
        super(props);
        
        this.state = {
            suggestions: [],
            item: {}
        };
        this.closePanel = this.closePanel.bind(this);
    }

    searchSuggestions (rawItemData) {
        const keywords = rawItemData.split(" ");
        const blocks = wp.data.select('core/block-editor').getBlocks();

        /* 
        Мысля
        Фразы не ищем, ищем только слова.
        Помечаем найденные слова жирным в нашей панели.
        Чем больше разных слов найдено в блоке, тем выше его стоимость.

        На панели имеем одну кнопку вставить ссылку, которая активируется, если в статье что-то выделено. (снять выделение при открытии панели подсказок)
        */
        let interestiongBlocks = [];

        for (const block of blocks) {
            let content = "";
            let blockRating = 0;
            let found = [];
            if (BlockAttributes[block.name] !== undefined) {
                try {
                    content = this.getBlockContent(block);
                } catch (e) {
                    content = '';
                }
                for (const word of keywords) {
                    let index = content.toLowerCase().indexOf(word.toLowerCase());
                    if (index === undefined) index = -1;
                    while (index !== -1) {
                        found.push(this.getTextCut(content, word, index));
                        blockRating++;

                        index = content.toLowerCase().indexOf(word.toLowerCase(), index+1);
                    }

                }
                if (found.length > 0) {
                    interestiongBlocks.push({
                        clientId: block.clientId,
                        blockName: block.name,
                        blockRating: blockRating,
                        found: found
                    });
                } 
            }
        }
        if (interestiongBlocks.length > 0) {

            console.log(interestiongBlocks);
            return interestiongBlocks;
        } else {
            console.log(`Подсказок не будет`)
            return false;
        }
    }

    getBlockContent(block) {
        let content = "";
        // const attrs = BlockAttributes[block.name];

        // for (const attr of attrs) {
        //     content += block.attributes[attr];
        // }

        content = block.originalContent;
        content = content.replace(/(<([^>]+)>)/ig,"");

        return content;
    }

    getTextCut(content, word, index) {
        return {
            before: content.slice(index-20, index),
            word: content.slice(index, index+word.length),
            after: content.slice(index+word.length, index+word.length+20)
        }
    }

    componentDidMount() {
        const {suggestionsData} = this.props;

        console.log("Raw Suggestions");
        console.log(suggestionsData.rawKeywords);
        
        console.log("Repared Suggestions");
        if (suggestionsData.rawKeywords) {

            const newState = this.searchSuggestions(suggestionsData.rawKeywords);
            if (newState)
                this.setState({
                    suggestions: newState,
                    linkItem: suggestionsData.linkItem
                });
        }

    }

    componentWillUnmount() {
        // clean suggestions
    }

    closePanel() {
        // empty string will close it
        this.props.toggleSuggestionsPanel(false);
    }

    render () {
        
        
        const className = "suggestion-panel";
        return (
            <div className={className}>
                <button onClick={this.closePanel}>🡰 Назад</button>
                <SuggestionList data={this.state}/>
            </div>
        )
        
    }
}