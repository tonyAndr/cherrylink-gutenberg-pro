import React from 'react';
import './Suggestions.css';
import Mark from 'mark.js'
import SuggestionInsert from './SuggestionInsert';
import SuggestionCopy from './SuggestionCopy';
import { Tooltip } from '@wordpress/components';

export class SuggestionList extends React.Component {

    gotoNode(isSingle, index) {
        const { suggestions } = this.props;
        if (isSingle) {

            suggestions.single[index].scrollIntoView({ block: 'center' })
            this.selectBlock(suggestions.single[index]);
        } else {
            suggestions.multi[index].scrollIntoView({ block: 'center' })
            this.selectBlock(suggestions.multi[index]);

        }
    }

    selectBlock(node) {
        let parent = node.closest("div.wp-block");
        if (parent) {
            let uid = parent.getAttribute("data-block");
            wp.data.dispatch("core/block-editor").selectBlock(uid);
        }
    }

    render() {
        const { suggestions, linkItem } = this.props;

        // const className = "suggestion-panel-open";
        if (suggestions.multi === undefined || (suggestions.multi.length === 0 && suggestions.single.length === 0)) {
            return (
                <>
                    <p className="suggestion-hint">Для данной ссылки подсказок не найдено. Попробуйте изменить <a target="_blank" href={window.location.origin + "/wp-admin/options-general.php?page=cherrylink-pro"}>настройки сканирования</a>.</p>
                    <p className="suggestion-hint">Для получения бОльшего количества подсказок рекомендуем включить пункт <strong>Использовать стемминг и стоп-слова</strong> в настройках сканирования.</p>
                    <p className="suggestion-hint">Если вы только что преобразовали статью из классического редактора в блоки, ее необходимо сохранить и обновить страницу.</p>
                </>
            )
        }

        const listMulti = suggestions.multi.map((x, i) => {
            return (<li key={i} onMouseDown={() => {this.gotoNode(false, i)}}>{x.innerText}</li>);
        });

        const listSingle = suggestions.single.map((x, i) => {
            return (<li key={i} onMouseDown={() => {this.gotoNode(true, i)}}>{x.innerText}</li>);
        });

        const output = (
            <>
                {listMulti.length > 0 && (<div className="suggestion-block">
                    <div className="block-name">Найдены фразы</div>
                    <div className="suggestion-list"><ol>{listMulti}</ol></div>
                </div>)}
                {listSingle.length > 0 && (<div className="suggestion-block">
                    <div className="block-name">Найдены слова</div>
                    <div className="suggestion-list"><ol>{listSingle}</ol></div>
                </div>)}
            </>
        );


        return (
            <>
                <p className="suggestion-hint">Подсказки для статьи:</p>
                <p className="suggestion-hint"><strong>{linkItem['data-title']}</strong></p>
                <hr />
                <div className='suggestion-action-buttons'>
                        <SuggestionCopy url={linkItem["data-url"]}/>
                        <SuggestionInsert linkObj={linkItem} inArticle={this.props.inArticle} />
                </div>
                <p className="suggestion-hint">Нажмите на один из предлагаемых анкоров, чтобы перейти к соответствующему блоку в редакторе.</p>
                {output}
            </>
        )
    


    }
}