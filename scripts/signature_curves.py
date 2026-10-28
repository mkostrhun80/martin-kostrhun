"""Remove pixel-trace stair steps and fit scalable cubic Bezier contours.

Work only on vector geometry. Arc-length sampling makes the smoothing radius
independent of how many vertices the source tracing placed on a given edge.
"""
import math
import re


def sub(a, b):
    return a[0] - b[0], a[1] - b[1]


def dot(a, b):
    return a[0] * b[0] + a[1] * b[1]


def unit(vector):
    length = math.hypot(*vector)
    return (vector[0] / length, vector[1] / length) if length else (1, 0)


def negate(vector):
    return -vector[0], -vector[1]


def smooth_samples(points, closed, sigma):
    vertices = [points[0]]
    for point in points[1:]:
        if point != vertices[-1]:
            vertices.append(point)
    if closed and vertices[-1] != vertices[0]:
        vertices.append(vertices[0])
    cumulative = [0]
    for a, b in zip(vertices, vertices[1:]):
        cumulative.append(cumulative[-1] + math.dist(a, b))
    length = cumulative[-1]
    if length == 0:
        return points
    count = max(4, math.ceil(length / .65))
    step = length / count
    samples = []
    edge = 0
    for i in range(count if closed else count + 1):
        distance = i * step
        while edge < len(vertices) - 2 and cumulative[edge + 1] < distance:
            edge += 1
        span = cumulative[edge + 1] - cumulative[edge]
        t = (distance - cumulative[edge]) / span
        samples.append(tuple(vertices[edge][j] * (1 - t) + vertices[edge + 1][j] * t for j in (0, 1)))
    radius = math.ceil(sigma * 3 / step)
    weights = [(offset, math.exp(-.5 * (offset * step / sigma) ** 2))
               for offset in range(-radius, radius + 1)]
    result = []
    for i in range(len(samples)):
        neighbors = [(samples[(i + offset) % len(samples)], weight)
                     for offset, weight in weights
                     if closed or 0 <= i + offset < len(samples)]
        total = sum(weight for _, weight in neighbors)
        result.append(tuple(sum(point[j] * weight for point, weight in neighbors) / total for j in (0, 1)))
    if not closed:
        result[0], result[-1] = points[0], points[-1]
    return result


def bezier(curve, t):
    return tuple(sum(curve[i][axis] * weight for i, weight in enumerate(
        ((1 - t) ** 3, 3 * t * (1 - t) ** 2, 3 * t * t * (1 - t), t ** 3))) for axis in (0, 1))


def fit(points, start_tangent, end_tangent, tolerance=.22):
    """Least-squares cubic fitting, subdividing until within tolerance."""
    first, last = points[0], points[-1]
    parameters = [0]
    for a, b in zip(points, points[1:]):
        parameters.append(parameters[-1] + math.dist(a, b))
    length = parameters[-1]
    if length == 0:
        return []
    parameters = [distance / length for distance in parameters]
    c00 = c01 = c11 = x0 = x1 = 0
    for point, t in zip(points, parameters):
        b0, b1, b2, b3 = (1 - t) ** 3, 3 * t * (1 - t) ** 2, 3 * t * t * (1 - t), t ** 3
        a = tuple(v * b1 for v in start_tangent)
        b = tuple(v * b2 for v in end_tangent)
        residual = tuple(point[j] - first[j] * (b0 + b1) - last[j] * (b2 + b3) for j in (0, 1))
        c00 += dot(a, a)
        c01 += dot(a, b)
        c11 += dot(b, b)
        x0 += dot(a, residual)
        x1 += dot(b, residual)
    determinant = c00 * c11 - c01 * c01
    if abs(determinant) > 1e-10:
        alpha = (x0 * c11 - x1 * c01) / determinant
        beta = (x1 * c00 - x0 * c01) / determinant
    else:
        alpha = beta = length / 3
    if min(alpha, beta) < length * 1e-6 or max(alpha, beta) > length:
        alpha = beta = math.dist(first, last) / 3
    curve = [first, tuple(first[j] + start_tangent[j] * alpha for j in (0, 1)),
             tuple(last[j] + end_tangent[j] * beta for j in (0, 1)), last]
    if len(points) <= 2:
        return [curve]
    errors = [math.dist(point, bezier(curve, t)) for point, t in zip(points, parameters)]
    split = max(range(1, len(points) - 1), key=lambda i: errors[i])
    if errors[split] <= tolerance:
        return [curve]
    center = unit(sub(points[split - 1], points[split + 1]))
    return (fit(points[:split + 1], start_tangent, center, tolerance) +
            fit(points[split:], negate(center), end_tangent, tolerance))


def curved_path(points, closed=False, sigma=1):
    samples = smooth_samples(points, closed, sigma)
    if closed:
        middle = len(samples) // 2
        start = unit(sub(samples[1], samples[-1]))
        center = unit(sub(samples[middle + 1], samples[middle - 1]))
        curves = (fit(samples[:middle + 1], start, negate(center)) +
                  fit(samples[middle:] + [samples[0]], center, negate(start)))
    else:
        curves = fit(samples, unit(sub(samples[1], samples[0])), unit(sub(samples[-2], samples[-1])))
    def fmt(point):
        return f'{point[0]:.3f} {point[1]:.3f}'
    return ('M' + fmt(samples[0]) + ' ' +
            ' '.join('C' + ' '.join(fmt(point) for point in curve[1:]) for curve in curves) +
            (' Z' if closed else ''))


def smooth_outline(path):
    contours = []
    for contour in re.findall(r'M([^Z]+)Z', path):
        numbers = [float(value) for value in re.findall(r'-?\d+(?:\.\d+)?', contour)]
        points = list(zip(numbers[::2], numbers[1::2]))
        contours.append(curved_path(points, closed=True))
    return ' '.join(contours)
