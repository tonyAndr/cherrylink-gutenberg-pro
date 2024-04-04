import React from 'react';
import './Suggestions.css';
import Mark from 'mark.js'
import SuggestionInsert from './SuggestionInsert';

export class SuggestionList extends React.Component {
    render() {
        const className = "suggestion-panel-open";
        const { data } = this.props;

        // iterate through blocks
        const output = data.suggestions.map(x => {
            // iterate through words + surrounding text
            const list = x.found.map(y => {
                return (
                    <li focusable="false" tabIndex="-1" onMouseDown={(e) => {
                        // e.preventDefault();
                        // document.getElementsByClassName("edit-post-visual-editor")[0].focus()
                        // wp.data.dispatch("core/block-editor").selectBlock(x.clientId);

                        let block = new Mark(document.querySelector("div[data-block='"+x.clientId+"']"));
                        block.mark(y.word, {
                            accuracy: "complementary"
                        })
                        // window.find(y.before + y.word + y.after);
                    }}>
                        {y.before && `...${y.before}`}
                        <strong>{y.word}</strong>
                        {y.after && `${y.after}...`}
                    </li>
                )
            })
            return (<div className="suggestion-block" onMouseDown={(e) => {
                // e.preventDefault();
                wp.data.dispatch("core/block-editor").selectBlock(x.clientId);
            }}>
                <div className="block-name">{x.blockName}</div>
                <div className="suggestion-list"><ol>{list}</ol></div>
            </div>)
        })
        if (output.length > 0) {

            return (
                <>
                    <SuggestionInsert linkObj={data.linkItem} />
                    <p className="suggestion-hint">Список блоков, которые лучше всего подходят для вставки ссылки. Нажмите на блок, чтобы выделить его в редакторе.</p>
                    {output}
                </>
            )
        }

        return (
            <>
                <p className="suggestion-hint">Для данной ссылки подсказок не найдено. Попробуйте изменить <a target="_blank" href={window.location.origin + "/wp-admin/options-general.php?page=linkate-posts&subpage=other"}>настройки индексирования</a>.</p>
                <p className="suggestion-hint">Если вы только что преобразовали статью из классического редактора в блоки, ее необходимо обновить (кнопка выше), и обновить страницу.</p>
            </>
        )
    }
}