import React from 'react';
import './StatsTab.css';
import { HorizontalRule } from '@wordpress/components';

export class StatsTab extends React.Component {

    constructor(props) {
        super(props);

        this.scrollInto = this.scrollInto.bind(this);
        this.findNode = this.findNode.bind(this);
    }

    // search for the needed node in the editors div
    findNode(href, ankor) {
        const { stats } = this.props;
        const nodes = document.querySelector(".edit-post-visual-editor").querySelectorAll('a[href*="' + href + '"]');
        const offset = stats[ankor].offset;
        // for (let n of nodes) {
        //     if (n.innerText === ankor) {
        //         console.log(n);
        //         return n;
        //     }
        // }
        console.log("Target offset: " + offset);
        return nodes[offset];

    }

    // goto node if found
    scrollInto(e) {
        e.preventDefault();
        let href = e.target.getAttribute('href');
        // let ankor = e.target.innerText;
        let ankor = parseInt(e.target.attributes["data-index"].value);
        if (!href) {
            return;
        }
        // try 1
        let node = this.findNode(href, ankor);
        if (this.showToUser(node)) return;

        // try 2
        let proto = location.protocol + "//";
        href = href.replace(proto, '');
        node = this.findNode(href, ankor);
        if (this.showToUser(node)) return;

        // try 3
        let host = location.host;
        href = href.replace(host, '');
        node = this.findNode(href, ankor);
        if (this.showToUser(node)) return;
        
        // Give up
        console.log("Ссылка не найдена в тексте");
    }

    showToUser(node) {
        if (node) {
            let selection = document.getSelection();
            selection.setBaseAndExtent(node, 0, node, 1)
            node.scrollIntoView({ block: 'center' })
            this.selectBlock(node);
            return true;
        }
        return false;
    }

    selectBlock(node) {
        let parent = node.closest("div.wp-block");
        if (parent) {
            let uid = parent.getAttribute("data-block");
            wp.data.dispatch("core/block-editor").selectBlock(uid);
        }
    }

    render() {
        const { stats, incoming } = this.props;
        const placeholder = "Ссылок пока нет...";
        let statsView, incomingView;
        // stats
        if (stats.length > 0) {
            statsView = stats.map((x, i) => {
                let ankor = x.keyword;
                if (!ankor || ankor.trim().length === 0) {
                    ankor = 'Без анкора';
                }
                return (<li key={i}>
                    <a href={x.url} target="_blank" data-index={i} onClick={this.scrollInto} title="Найти в тексте">{ankor}</a>
                    <span>Ссылается на <a href={x.url} target="_blank" title="Переход по ссылке">{x.url}</a></span>
                </li>)
            })

            statsView = <ol className="cherry-stats">{statsView}</ol>;
        } else {
            statsView = <div>{placeholder}</div>
        }

        // incoming
        if (incoming.count > 0) {
            incomingView = incoming.links.map((x, i) => {
                let ankor = x.ankor;
                if (!ankor || ankor.trim().length === 0) {
                    ankor = 'Без анкора';
                }
                return (<li key={i}>
                    <span>Ссылка с анкором: <strong className="cherry-incoming-ankor">{ankor}</strong></span>
                    <span>Из статьи: <a href={x.source_url} target="_blank" title="Переход по ссылке">{x.source_url}</a></span>
                </li>)
            })
            incomingView = <ol className="cherry-incoming">{incomingView}</ol>;
        } else {
            incomingView = <div>{placeholder}</div>;
        }

        return (<div className="cherry-stats-container">
            <h2>Входящие ссылки</h2>
            {incomingView}
            <HorizontalRule />
            <h2>Исходящие ссылки</h2>
            {statsView}
        </div>)
    }
}