/* Example:
<Pager ref={(c) => this._pager = c} current={pagination.current} total={pagination.total} per={pagination.per} onSelect={this.handlePage}/>

pagination: {
    current: 1,
    total: 0,
    per: 20
}
handlePage() {
    let pager = {
        ...this.state.pagination
    };
    pager.current = this._pager
        ? this._pager.state.currentPage
        : 1;
    this.setState({
        pagination: pager
    }, () => {
        this.props.router.push({
            pathname: '/?page=' + pager.current
        });
    });
}
*/

import React from 'react';
import './pager.css';

const i18n = {
    en: {
        first: 'First',
        last: 'Last',
        prev: 'Prev',
        next: 'Next',
        total: 'Total',
        entry: 'entries'
    },
    cn: {
        first: '首页',
        last: '末页',
        prev: '上页',
        next: '下页',
        total: '共',
        entry: '项'
    }
};

export default class Pager extends React.Component {
    constructor(props) {
        super();
        this.state = {
            rotate: props.rotate,
            currentPage: props.current,
            maxSize: Number(props.maxSize),
            pageSize: Number(props.per),
            lang: i18n[props.lang]
        };
        this.goPrev = this.goPrev.bind(this);
        this.goNext = this.goNext.bind(this);
        this.goFirst = this.goFirst.bind(this);
        this.goLast = this.goLast.bind(this);
    }

    makePage(number, text, isActive) {
        return {number: number, text: text, active: isActive};
    }
    getPages(currentPage, totalPages) {
        currentPage = currentPage - 0;
        var pages = [],
            startPage = 1,
            endPage = totalPages;
        var maxSize = this.state.maxSize;
        var isMaxSized = maxSize < totalPages;
        if (isMaxSized) {
            if (this.state.rotate) {
                startPage = ((Math.ceil(currentPage / maxSize) - 1) * maxSize) + 1;
                endPage = Math.min(startPage + maxSize - 1, totalPages);
            } else {
                startPage = Math.max(currentPage - Math.floor(maxSize / 2), 1);
                endPage = startPage + maxSize - 1;
                if (endPage > totalPages) {
                    endPage = totalPages;
                    startPage = endPage - maxSize + 1;
                }
            }
        }
        for (var number = startPage; number <= endPage; number++) {
            var page = this.makePage(number, number, number === currentPage);
            pages.push(page);
        }
        if (isMaxSized && this.state.rotate) {
            if (startPage > 1) {
                var previousPageSet = this.makePage(startPage - 1, '...', false);
                pages.unshift(previousPageSet);
            }
            if (endPage < totalPages) {
                var nextPageSet = this.makePage(endPage + 1, '...', false);
                pages.push(nextPageSet);
            }
        }
        return pages;
    }
    goPrev() {
        let currentPage = this.state.currentPage - 0;
        if (currentPage > 1) {
            this.setState({
                currentPage: currentPage - 1
            }, () => {
                this.props.onSelect();
            });
        }
    }
    goNext() {
        let currentPage = this.state.currentPage - 0;
        if (currentPage < Math.ceil(this.props.total / this.state.pageSize)) {
            this.setState({
                currentPage: currentPage + 1
            }, () => {
                this.props.onSelect();
            });
        }
    }
    goFirst() {
        let currentPage = this.state.currentPage - 0;
        if (currentPage !== 1) {
            this.setState({
                currentPage: 1
            }, () => {
                this.props.onSelect();
            });
        }
    }
    goLast() {
        let currentPage = this.state.currentPage - 0;
        let totalPage = Math.ceil(this.props.total / this.state.pageSize);
        if (currentPage < totalPage) {
            this.setState({
                currentPage: totalPage
            }, () => {
                this.props.onSelect();
            });
        }
    }
    goTo(num) {
        this.setState({
            currentPage: num
        }, () => {
            this.props.onSelect();
        });
    }
    render() {
        let {currentPage, pageSize, lang} = this.state;
        let {total, innerClass, className} = this.props;
        let totalPage = Math.ceil(total / pageSize);
        const pages = this.getPages(currentPage, totalPage);
        const Pagelist = () => {
            return (
                <ul className={innerClass || 'pagination'}>
                    <li className={currentPage === 1
                        ? 'disabled'
                        : ''}>
                        <a href="javascript:;" className="first" onClick={this.goFirst}>{lang.first}</a>
                    </li>
                    <li className={currentPage === 1
                        ? 'disabled'
                        : ''}>
                        <a href="javascript:;" className="prev" onClick={this.goPrev}>{lang.prev}</a>
                    </li>
                    {pages.map((item, i) => {
                        return (
                            <li key={i} className={item.active
                                ? 'active'
                                : ''}>
                                <a href="javascript:;" onClick={this.goTo.bind(this, item.number)}>{item.text}</a>
                            </li>
                        );
                    })}
                    <li className={currentPage >= totalPage
                        ? 'disabled'
                        : ''}>
                        <a href="javascript:;" className="next" onClick={this.goNext}>{lang.next}</a>
                    </li>
                    <li className={currentPage >= totalPage
                        ? 'disabled'
                        : ''}>
                        <a href="javascript:;" className="last" onClick={this.goLast}>{lang.last}</a>
                    </li>
                </ul>
            );
        };
        return (
            <div className={className || 'pager-wrap'}>
                <span>{lang.total + ' ' + total + ' ' + lang.entry}</span>
                <Pagelist/>
            </div>
        );
    }
}

Pager.defaultProps = {
    rotate: false,
    current: 0,
    maxSize: 5,
    per: 10,
    lang: 'en'
};
