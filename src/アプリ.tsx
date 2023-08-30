import { ReactElement, ReactNode, useState } from 'react'
import styled from "styled-components";

const 主要容器 = styled.main`
    width: 50%;
    margin: auto;
    display: flex;
    flex-flow: column;
    align-items: center;
`

const 表題 = styled.h1``

const ボード容器 = styled.div`
    display: grid;
    grid-template-columns: 30% 30% 30%;
    justify-content: space-between;
    padding: 10px;
`

const ボードの独居室 = styled.div<{ 有効?: string }>`
    display: flex;
    justify-content: center;
    align-items: center;
    min-width: 40px;
    min-height: 40px;
    border: 1px solid black;
    margin: 4px;

    ${({ 有効 }) => 有効 ? `
    cursor: pointer;
    background: limegreen;
    ` : ""}
`

const メニュー = styled.div`
    position: absolute;
    width: 100%;
    height: 100vh;

    * > div {
        margin: auto;
        padding: 8px;
        border-radius: 8px;
        border: 1px solid black;
        display: flex;
        flex-flow: column;
        align-items: center;
    }
`

type ボード資料の種類 = (number[][] | number)[][];
type 独居室の種類 = {
    行: number;
    列: number;
}
type 選んだ独居室の種類 = {
    外側: 独居室の種類;
    内側: 独居室の種類;
}

const 空のボード生成する = (): ボード資料の種類 => [...Array(3)].map(_ => [...Array(3)].map(_ => [...Array(3)].map(_ => Array(3).fill(0))));

const 勝利を確認する = (ボードの状況: number[][]) => {
    const 水平線 = Array(3).fill(0);
    const 垂直線 = Array(3).fill(0);
    const 対角線 = Array(3).fill(0); // 確認する時に便利だから、３を使います

    ボードの状況.forEach((行: number[], 行番目: number) => {
        行.forEach((列: number, 列番目: number) => {
            水平線[行番目] += 列;
            垂直線[列番目] += 列;
            if (行番目 === 列番目) 対角線[0] += 列;
            if (行番目 === 3 - 列番目 - 1) 対角線[1] += 列;
        })
    })

    // 勝利の答え → +3/-3
    for (let 号 = 0; 号 < 3; 号++) {
        if (Math.abs(水平線[号]) === 3) return 水平線[号] / 3;
        if (Math.abs(垂直線[号]) === 3) return 垂直線[号] / 3;
        if (Math.abs(対角線[号]) === 3) return 対角線[号] / 3;
    }
    return 0;
}

const 独居室のデータ = (プレーヤー: number): string => {
    switch (プレーヤー) {
        case 1:
            return "〇";
        case -1:
            return "✕";
        default:
            return "";
    }
}

const 有効独居室ですか = (有効独居室: 独居室の種類 | null, 今の独居室: 独居室の種類, 内側のデータ: number): boolean => {
    if (内側のデータ !== 0) return false;
    if (有効独居室 === null) return true;
    return 有効独居室.行 === 今の独居室.行 && 有効独居室.列 === 今の独居室.列;
}

const ゲームボード = ({ 資料, 押すとき, 有効独居室 }: { 資料: ボード資料の種類, 押すとき: (選んだ独居室: 選んだ独居室の種類) => void, 有効独居室: 独居室の種類 | null }): ReactNode => {
    return (
        <ボード容器>
            {資料.map((外側の行, 外行番目) => 外側の行.map((外側のデータ, 外列番目) => (
                typeof 外側のデータ === "number" ? (
                    <ボードの独居室 key={`外行${外行番目}外列${外列番目}`}>{独居室のデータ(外側のデータ)}</ボードの独居室>
                ) : (
                    <ボード容器 key={`外行${外行番目}外列${外列番目}`}>
                        {外側のデータ.map((内側の行, 内行番目) => 内側の行.map((内側のデータ, 内列番目) => (
                            <ボードの独居室
                                key={`外行${外行番目}外列${外列番目}内行${内行番目}内列${内列番目}`}
                                有効={有効独居室ですか(有効独居室, { 行: 外行番目, 列: 外列番目 }, 内側のデータ) ? "true" : undefined}
                                onClick={() => 有効独居室ですか(有効独居室, { 行: 外行番目, 列: 外列番目 }, 内側のデータ) && 押すとき({
                                    外側: { 行: 外行番目, 列: 外列番目 },
                                    内側: { 行: 内行番目, 列: 内列番目 }
                                })}>{独居室のデータ(内側のデータ)}</ボードの独居室>
                        )))}
                    </ボード容器>
                )
            )))}
        </ボード容器>
    )
}

const アプリ = (): ReactElement => {
    const [ボード資料, ボード資料設定する] = useState<ボード資料の種類>(空のボード生成する());
    const [今のプレーヤー, 今のプレーヤー設定する] = useState<number>(1);    // 1 - 〇, -1 - ✕
    const [勝ったプレーヤー, 勝ったプレーヤー設定する] = useState<number>(0); // 1 - 〇, -1 - ✕
    const [有効独居室, 有効独居室設定する] = useState<独居室の種類 | null>(null);

    const プレーヤーの動き = ({ 外側, 内側 }: 選んだ独居室の種類) => {
        // 動きを書きます
        const 新しいボード = [...ボード資料];
        const 選んだ外独居室 = 新しいボード[外側.行][外側.列];
        if (typeof 選んだ外独居室 !== "number") {
            選んだ外独居室[内側.行][内側.列] = 今のプレーヤー;

            // 内側の勝利を確認する
            const 内勝ったプレーヤー = 勝利を確認する(選んだ外独居室);
            if (内勝ったプレーヤー !== 0) {
                新しいボード[外側.行][外側.列] = 内勝ったプレーヤー;
                有効独居室設定する(null);
            } else if (typeof 新しいボード[内側.行][内側.列] !== "number") {
                有効独居室設定する({
                    行: 内側.行,
                    列: 内側.列
                })
            } else {
                有効独居室設定する(null);
            }
        }

        // 外側の勝利を確認する
        const 外勝ったプレーヤー = 勝利を確認する(新しいボード.map(外行 => 外行.map(数 => typeof 数 === "number" ? 数 : 0)));
        if (外勝ったプレーヤー !== 0) {
            // 勝ちました！！
            勝ったプレーヤー設定する(外勝ったプレーヤー);
        }

        ボード資料設定する(新しいボード);
        今のプレーヤー設定する(前の => 前の * -1);
    }

    const ゲーム再開する = () => {
        ボード資料設定する(空のボード生成する());
        勝ったプレーヤー設定する(0);
        有効独居室設定する(null);
    }

    return (
        <主要容器>
            <表題>超〇✕</表題>
            <h3>今プレーヤーの動き: {独居室のデータ(今のプレーヤー)}</h3>
            <ゲームボード 資料={ボード資料} 押すとき={プレーヤーの動き} 有効独居室={有効独居室} />
            <p>
                The next player can only play a move at the outer cell that is corresponding to the inner cell that the previous player plays at.
                The outer cell will display the winner of the inner cell.
                Win the outer board to win the game
            </p>
            {勝ったプレーヤー !== 0 && <メニュー>
                <div>
                    <h1>プレーヤー {独居室のデータ(勝ったプレーヤー)} の勝ちだ！</h1>
                    <button onClick={ゲーム再開する}>再開する</button>
                </div>
            </メニュー>}
        </主要容器>
    );
}

export default アプリ;
