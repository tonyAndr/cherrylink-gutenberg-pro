import React from 'react';
import { SuggestionList } from './SuggestionList';
import Snowball from 'snowball';
import Mark from 'mark.js';
import { showNotice } from '../Notices';
import {Button, Tooltip} from '@wordpress/components'

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
            suggestions: {},
            item: {}
        };
        this.closePanel = this.closePanel.bind(this);
    }

    isInArticle(item, stats) {
        let inAricle = false;
        const convertedUrl = this.props.convertUrl(item['data-url']);
        for (let i in stats) {
            if (convertedUrl === stats[i].url) {
                inAricle = true;
                break;
            }
        }
        return inAricle;
    }

    stemmKeywords(rawData) {
        let words = rawData.trim().split(" ");
        const stemmer = new Snowball('Russian');
        words = words.map(x => {
            stemmer.setCurrent(x);
            stemmer.stem();
            let stemmed = stemmer.getCurrent();
            if (stemmed && stemmed.trim()) {
                return stemmed;
            }
        })

        return words;
    }

    searchSuggestions(rawItemData) {
        let addSingleWords = cherrylink_options.singleword_suggestions === "true";
        let keywords = this.stemmKeywords(rawItemData);
        let nodeLinks = {
            single: [],
            multi: []
        };
        // TODO remove blacklisted

        // create pairs
        const keysLen = keywords.length;
        let setOfPairsRegexes = [];
        keywords.map((x, i) => {
            // let set = [];
            for (let j = 0; j < keysLen; j++) {
                if (j !== i) {
                    setOfPairsRegexes.push(new RegExp(`(?:^|\\s)(${x}[^\\n\\.,\\(\\)\\[\\]]*?${keywords[j]}[А-ЯЁA-Z]*)`, 'gmiu'));
                }
            }
        })

        // TODO: add switcher
        // if (addWords) {
        //     keywords = pairs.concat(keywords);
        // } else {
        //     keywords = pairs;
        // }

        let editor = document.getElementsByClassName("edit-post-visual-editor")[0];
        let context = new Mark(editor);
        context.unmark();

        for (const kw of setOfPairsRegexes) {
            context.markRegExp(kw, {
                // accuracy: "complementary",
                // wildcards: "withSpaces",
                exclude: ["h1", "h2", "h3", "h4", "h5", "a", ".ignore", "textarea", ".editor-post-title"],
                each: (element) => {
                    nodeLinks.multi.push(element);
                },
            })      
        }

        if (addSingleWords) {
            for (const kw of keywords) {
                context.mark(kw, {
                    accuracy: "complementary",
                    exclude: ["h1", "h2", "h3", "h4", "h5", "a", ".ignore", "textarea", ".editor-post-title", "mark"],
                    each: (element) => {
                        nodeLinks.single.push(element);
                    },
                })      
            }
        }

        return nodeLinks;
    }

    getBlockContent(block) {
        let content = "";
        // const attrs = BlockAttributes[block.name];

        // for (const attr of attrs) {
        //     content += block.attributes[attr];
        // }

        content = block.originalContent;
        content = content.replace(/(<([^>]+)>)/ig, "");

        return content;
    }

    getTextCut(content, word, index) {
        return {
            before: content.slice(index - 20, index),
            word: content.slice(index, index + word.length),
            after: content.slice(index + word.length, index + word.length + 20)
        }
    }

    componentDidMount() {
        const { suggestionsData, stats } = this.props;

        console.log("Raw Suggestions");
        console.log(suggestionsData.rawKeywords);

        console.log("Repared Suggestions");
        if (suggestionsData.rawKeywords) {

            const newState = this.searchSuggestions(suggestionsData.rawKeywords);
            const inArticle = this.isInArticle(suggestionsData.linkItem, stats);
            if (newState)
                this.setState({
                    suggestions: newState,
                    linkItem: suggestionsData.linkItem,
                    inArticle
                });
        }

    }

    componentWillUnmount() {
        // clean suggestions
    }

    closePanel() {
        // empty string will close it
        let editor = document.getElementsByClassName("edit-post-visual-editor")[0];
        let context = new Mark(editor);
        context.unmark();
        this.props.toggleSuggestionsPanel(false);
    }

    render() {

        const className = "suggestion-panel";
        return (
            <div className={className}>
                <Tooltip text="Выйти к списку ссылок">
                    <Button id="cherry_suggestions_close" className='is-tertiary' onClick={this.closePanel}>🡰 Назад</Button>
                </Tooltip>
                <SuggestionList {...this.state}  />
            </div>
        )

    }
}