# openAI embeddings - text-embedding-ada-002

# Loss Functions for Embedding Learning

## 1. **Contrastive Loss**
Contrastive loss focuses on minimizing the distance between embeddings of similar pairs (positive pairs) and maximizing the distance between dissimilar pairs (negative pairs).





**Mathematical Formula**:

<math xmlns="http://www.w3.org/1998/Math/MathML" display="block">
  <mrow>
    <mi>L</mi>
    <mo>=</mo>
    <mi>y</mi>
    <mo>&#x22C5;</mo>
    <msup>
      <mi>D</mi>
      <mn>2</mn>
    </msup>
    <mo>+</mo>
    <mo>(</mo>
    <mn>1</mn>
    <mo>&#x2212;</mo>
    <mi>y</mi>
    <mo>)</mo>
    <mo>&#x22C5;</mo>
    <mo>max</mo>
    <mo>(</mo>
    <mn>0</mn>
    <mo>,</mo>
    <mi>m</mi>
    <mo>&#x2212;</mo>
    <mi>D</mi>
    <mo>)</mo>
    <msup>
      <mo>)</mo>
      <mn>2</mn>
    </msup>
  </mrow>
</math>


Where:

- \(D = \|f(x_1) - f(x_2)\|\): The distance between the embeddings of two examples.
- \(y \in \{0, 1\}\): Label indicating whether the pair is positive (\(y = 1\)) or negative (\(y = 0\)).
- \(m\): A margin that specifies the minimum distance required for negative pairs.

**Intuition**:

- For positive pairs (\(y = 1\)): Minimize \(D^2\) to bring them closer.
- For negative pairs (\(y = 0\)): Maximize \(D\) so that it is at least \(m\).

---

## 2. **Triplet Loss**
Triplet loss enforces that the anchor is closer to the positive example than the negative example by a margin \(m\).

**Mathematical Formula**:
\[
\mathcal{L} = \max(0, \|f(a) - f(p)\|^2 - \|f(a) - f(n)\|^2 + m)
\]


Where:

- \(f(a)\): Embedding of the anchor.
- \(f(p)\): Embedding of the positive (similar) example.
- \(f(n)\): Embedding of the negative (dissimilar) example.
- \(m\): A margin that enforces a separation between positive and negative distances.

**Intuition**:

- The loss penalizes cases where the distance between the anchor and positive (\(\|f(a) - f(p)\|\)) is not sufficiently smaller than the distance between the anchor and negative (\(\|f(a) - f(n)\|)) by at least the margin \(m\).

---

## 3. **Generalized Triplet Loss**
This loss generalizes the triplet loss by considering multiple negative examples (\(N-1\) negatives) in a batch for joint comparison.

**Mathematical Formula**:

L = (1 / N) * Σ(max(0, ||f(ai) - f(pi)||^2 - min(||f(ai) - f(nj)||^2) + m))


Where:

- \(f(a_i)\): Embedding of the anchor for the \(i\)-th example.
- \(f(p_i)\): Embedding of the positive (similar) example for the \(i\)-th anchor.
- \(\min_{j \neq i} \|f(a_i) - f(n_j)\|\): The distance to the closest negative embedding among \(N-1\) negatives.
- \(m\): A margin for separation between positive and negative distances.

**Intuition**:

- Instead of a single negative, this loss considers multiple negatives from the batch, forcing the model to learn a more robust separation in the embedding space.

---





### reference 
1. [Text and Code Embeddings by Contrastive Pre-Training](https://arxiv.org/pdf/2201.10005#page=12&zoom=100,48,565)
1. [Improved Deep Metric Learning with Multi-class N-pair Loss Objective](https://papers.nips.cc/paper_files/paper/2016/file/6b180037abbebea991d8b1232f8a8ca9-Paper.pdf)

